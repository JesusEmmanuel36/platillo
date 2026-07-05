import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

/**
 * Normaliza el texto para detectar frases aunque tengan acentos.
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Detecta cuando el cliente quiere realizar un pedido.
 */
function wantsToPlaceOrder(message) {
  const normalizedMessage = normalizeText(message);

  return (
    /\b(quiero|quisiera|deseo|necesito|me gustaria)\b.{0,35}\b(pedir|ordenar|pedido)\b/.test(
      normalizedMessage,
    ) ||
    /\b(como|donde)\b.{0,30}\b(pedir|ordenar|pedido)\b/.test(
      normalizedMessage,
    ) ||
    /\b(hacer|realizar|levantar)\b.{0,20}\b(un )?pedido\b/.test(
      normalizedMessage,
    ) ||
    normalizedMessage.includes("voy a pedir")
  );
}

/**
 * Busca el restaurante asociado al número empresarial
 * que recibió el mensaje.
 */
async function getRestaurantByPhoneNumberId(phoneNumberId) {
  if (!phoneNumberId) {
    return null;
  }

  const snapshot = await db
    .collection("restaurants")
    .where(
      "whatsapp.phoneNumberId",
      "==",
      String(phoneNumberId),
    )
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const restaurantDocument = snapshot.docs[0];
  const restaurantData = restaurantDocument.data();

  if (restaurantData?.whatsapp?.enabled !== true) {
    console.log("El chatbot está desactivado para este restaurante");

    return null;
  }

  if (!restaurantData?.name || !restaurantData?.slug) {
    console.error(
      "El restaurante no tiene name o slug configurado:",
      restaurantDocument.id,
    );

    return null;
  }

  return {
    id: restaurantDocument.id,
    ...restaurantData,
  };
}

/**
 * Meta usa esta petición para verificar el webhook.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token === verifyToken &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return NextResponse.json(
    {
      error: "No fue posible verificar el webhook",
    },
    {
      status: 403,
    },
  );
}

/**
 * Envía un mensaje normal de WhatsApp.
 *
 * Usa el phone_number_id que recibió el mensaje.
 * Si no viene, usa el configurado en el entorno.
 */
async function sendWhatsAppMessage(
  recipientPhone,
  message,
  businessPhoneNumberId,
) {
  const accessToken = getRequiredEnv("WHATSAPP_TOKEN");

  const phoneNumberId =
    businessPhoneNumberId ||
    getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

  const graphVersion =
    process.env.META_GRAPH_API_VERSION || "v25.0";

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "text",
        text: {
          preview_url: true,
          body: message.slice(0, 4000),
        },
      }),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    console.error(
      "Error de WhatsApp Cloud API:",
      responseBody,
    );

    throw new Error(
      `Error enviando mensaje de WhatsApp: ${response.status}`,
    );
  }

  return responseBody;
}

/**
 * Construye la respuesta exacta para hacer un pedido.
 */
function generateOrderReply(restaurant) {
  const orderUrl =
    `https://pide.platillo.mx/${restaurant.slug}`;

  return `¡Claro! Puedes hacer tu pedido en ${restaurant.name} desde este enlace:\n\n${orderUrl}`;
}

/**
 * Genera una respuesta general usando Gemini.
 */
async function generateGeminiReply(
  customerMessage,
  restaurant,
) {
  const orderUrl =
    `https://pide.platillo.mx/${restaurant.slug}`;

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: customerMessage,
    config: {
      systemInstruction: `
Eres el asistente virtual de ${restaurant.name}.

Información verificada del negocio:
- Nombre: ${restaurant.name}
- Slug: ${restaurant.slug}
- Enlace para pedidos: ${orderUrl}

Reglas:
- Responde de manera natural, amable y breve.
- Responde en español, salvo que el cliente use claramente otro idioma.
- Usa como máximo tres párrafos cortos.
- No digas que eres Gemini.
- No inventes productos, precios, horarios ni información del negocio.
- Cuando alguien quiera hacer un pedido, indícale que puede pedir en ${restaurant.name}.
- Cuando compartas el enlace de pedidos, usa únicamente: ${orderUrl}
- No cambies ni inventes otro enlace.
      `.trim(),
      temperature: 0.7,
      maxOutputTokens: 350,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    return `Hola, soy el asistente virtual de ${restaurant.name}.`;
  }

  return text;
}

/**
 * Recibe los mensajes entrantes de WhatsApp.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    console.log(
      "Webhook recibido:",
      JSON.stringify(body, null, 2),
    );

    const entries = body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];

      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages || [];

        /*
         * Los eventos de enviado, entregado o leído
         * no contienen messages.
         */
        if (messages.length === 0) {
          continue;
        }

        /*
         * Este es el número empresarial que recibió
         * el mensaje, no el número del cliente.
         */
        const businessPhoneNumberId =
          value?.metadata?.phone_number_id;

        if (!businessPhoneNumberId) {
          console.error(
            "El webhook no contiene metadata.phone_number_id",
          );

          continue;
        }

        const restaurant =
          await getRestaurantByPhoneNumberId(
            businessPhoneNumberId,
          );

        if (!restaurant) {
          console.error(
            "No se encontró un restaurante activo para:",
            businessPhoneNumberId,
          );

          for (const incomingMessage of messages) {
            const senderPhone = incomingMessage?.from;

            if (!senderPhone) {
              continue;
            }

            await sendWhatsAppMessage(
              senderPhone,
              "Por el momento no pude identificar el negocio asociado a este número.",
              businessPhoneNumberId,
            );
          }

          continue;
        }

        console.log("Restaurante asociado:", {
          restaurantId: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          phoneNumberId: businessPhoneNumberId,
        });

        for (const incomingMessage of messages) {
          const senderPhone = incomingMessage?.from;
          const messageType = incomingMessage?.type;
          const messageId = incomingMessage?.id;

          console.log("Mensaje entrante:", {
            senderPhone,
            messageType,
            messageId,
          });

          if (!senderPhone) {
            continue;
          }

          if (messageType !== "text") {
            await sendWhatsAppMessage(
              senderPhone,
              "Por ahora solamente puedo responder mensajes de texto.",
              businessPhoneNumberId,
            );

            continue;
          }

          const customerMessage =
            incomingMessage?.text?.body?.trim();

          if (!customerMessage) {
            continue;
          }

          let reply;

          /*
           * La intención de hacer un pedido se responde
           * directamente para garantizar el enlace correcto.
           */
          if (wantsToPlaceOrder(customerMessage)) {
            reply = generateOrderReply(restaurant);
          } else {
            reply = await generateGeminiReply(
              customerMessage,
              restaurant,
            );
          }

          await sendWhatsAppMessage(
            senderPhone,
            reply,
            businessPhoneNumberId,
          );
        }
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Error en webhook de WhatsApp:",
      error,
    );

    /*
     * Devolvemos 200 para evitar que Meta reintente
     * constantemente el mismo evento.
     */
    return NextResponse.json({
      received: true,
      error: true,
    });
  }
}