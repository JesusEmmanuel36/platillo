import { adminAuth, db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function registrarWhatsappEnviado(restaurantRef) {
  await restaurantRef.update({
    "whatsappStats.sentThisMonth": FieldValue.increment(1),
    "whatsappStats.failedThisMonth": FieldValue.increment(0),
    "whatsappStats.lastSentAt": FieldValue.serverTimestamp(),
  });
}

async function registrarWhatsappFallido(restaurantRef, restaurant) {
  const updates = {
    "whatsappStats.failedThisMonth": FieldValue.increment(1),
    "whatsappStats.sentThisMonth": FieldValue.increment(0),
  };

  if (restaurant?.whatsappStats?.lastSentAt === undefined) {
    updates["whatsappStats.lastSentAt"] = null;
  }

  await restaurantRef.update(updates);
}

export async function POST(req) {
  let restaurantRefParaStats = null;
  let restaurantParaStats = null;
  let intentoEnviarWhatsapp = false;

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { orderId } = await req.json();

    if (!orderId) {
      return Response.json({ error: "Falta orderId" }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return Response.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const order = orderSnap.data();

    const restaurantRef = db.collection("restaurants").doc(order.restaurantId);
    const restaurantSnap = await restaurantRef.get();

    if (!restaurantSnap.exists) {
      return Response.json(
        { error: "Restaurante no encontrado" },
        { status: 404 },
      );
    }

    const restaurant = restaurantSnap.data();

    restaurantRefParaStats = restaurantRef;
    restaurantParaStats = restaurant;

    if (restaurant.uid !== uid) {
      return Response.json({ error: "No tienes permiso" }, { status: 403 });
    }

    const telefono = `52${order.cliente.telefono}`;
    const nombreCliente = order.cliente.nombre;
    const nombreRestaurante = restaurant.name;
    const resumenPedido = order.items
      .map((item) => `(x${item.quantity}) ${item.name}`)
      .join(", ");

    intentoEnviarWhatsapp = true;

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: telefono,
          type: "template",
          template: {
            name: "pedido_en_camino",
            language: {
              code: "es_MX",
            },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "text",
                    text: nombreCliente,
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: nombreRestaurante,
                  },
                  {
                    type: "text",
                    text: resumenPedido,
                  },
                ],
              },
            ],
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      await registrarWhatsappFallido(restaurantRef, restaurant);
      return Response.json(data, { status: response.status });
    }

    await registrarWhatsappEnviado(restaurantRef);

    return Response.json({ ok: true, data });
  } catch (error) {
    if (intentoEnviarWhatsapp && restaurantRefParaStats) {
      await registrarWhatsappFallido(
        restaurantRefParaStats,
        restaurantParaStats,
      );
    }

    return Response.json({ error: error.message }, { status: 500 });
  }
}