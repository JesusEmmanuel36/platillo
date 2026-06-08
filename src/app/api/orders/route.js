// app/api/orders/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Helpers ────────────────────────────────────────────────────────────────

function esStringValido(val) {
  return typeof val === "string" && val.trim().length > 0;
}

function estaAbierto(restaurante) {
  if (restaurante.alwaysOpen) return true;
  if (!restaurante.isOpen) return false;

  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const mx = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Monterrey" }));
  const diaActual = dias[mx.getDay()];
  const horaActual = mx.getHours() * 60 + mx.getMinutes();

  const horario = restaurante.horarios?.find((h) => h.dia === diaActual);
  if (!horario || !horario.abierto) return false;

  const [aH, aM] = horario.apertura.split(":").map(Number);
  const [cH, cM] = horario.cierre.split(":").map(Number);

  return horaActual >= aH * 60 + aM && horaActual < cH * 60 + cM;
}

function validarCliente(cliente) {
  if (!cliente || typeof cliente !== "object") return "Cliente inválido.";
  if (!esStringValido(cliente.nombre)) return "Nombre del cliente inválido.";
  if (!/^\d{10}$/.test(cliente.telefono)) return "Teléfono inválido (10 dígitos requeridos).";
  return null;
}

function validarEntrega(entrega) {
  if (!entrega || typeof entrega !== "object") return "Entrega inválida.";
  if (!["domicilio", "local"].includes(entrega.tipo)) return "Tipo de entrega inválido.";
  if (entrega.tipo === "domicilio") {
    if (!esStringValido(entrega.calle)) return "Calle obligatoria.";
    if (!esStringValido(entrega.numero)) return "Número obligatorio.";
    if (!esStringValido(entrega.colonia)) return "Colonia obligatoria.";
    if (!/^\d{5}$/.test(entrega.postal)) return "Código postal inválido (5 dígitos).";
  }
  return null;
}

function calcularPrecioItem(productoDB, itemFrontend) {
  const errores = [];
  const esDynamic = productoDB.priceType === "dynamic";

  let precio = esDynamic ? 0 : Number(productoDB.price ?? 0);

  const optionsFrontend = itemFrontend.options;

  if (!productoDB.options || productoDB.options.length === 0) {
    return { precio: Number(productoDB.price ?? 0), errores };
  }

  if (!optionsFrontend || typeof optionsFrontend !== "object") {
    return { precio: null, errores: ["options inválidas."] };
  }

  for (const grupoDB of productoDB.options) {
    const titulo = grupoDB.title;
    const valorFrontend = optionsFrontend[titulo];

    if (grupoDB.required && valorFrontend === undefined) {
      errores.push(`Opción requerida faltante: "${titulo}".`);
      continue;
    }
    if (valorFrontend === undefined) continue;

    if (grupoDB.type === "radio") {
      if (typeof valorFrontend !== "object" || Array.isArray(valorFrontend)) {
        errores.push(`"${titulo}" debe ser un objeto.`);
        continue;
      }
      const choiceDB = grupoDB.choices.find((c) => c.name === valorFrontend.name);
      if (!choiceDB) {
        errores.push(`Opción "${valorFrontend.name}" no existe en "${titulo}".`);
        continue;
      }
      if (esDynamic) {
        precio = Number(choiceDB.price);
      } else {
        precio += Number(choiceDB.price);
      }
    }

    if (grupoDB.type === "checkbox") {
      if (!Array.isArray(valorFrontend)) {
        errores.push(`"${titulo}" debe ser un array.`);
        continue;
      }
      if (valorFrontend.length > grupoDB.maxSelectable) {
        errores.push(`"${titulo}" supera el máximo de ${grupoDB.maxSelectable} selecciones.`);
        continue;
      }
      for (const seleccion of valorFrontend) {
        if (!seleccion || typeof seleccion !== "object" || !esStringValido(seleccion.name)) {
          errores.push(`Item inválido en "${titulo}".`);
          continue;
        }
        const choiceDB = grupoDB.choices.find((c) => c.name === seleccion.name);
        if (!choiceDB) {
          errores.push(`"${seleccion.name}" no existe en "${titulo}".`);
          continue;
        }
        precio += Number(choiceDB.price);
      }
    }

    if (grupoDB.type === "addable") {
      if (typeof valorFrontend !== "object" || Array.isArray(valorFrontend)) {
        errores.push(`"${titulo}" debe ser un objeto.`);
        continue;
      }
      let totalComplementos = 0;
      for (const [, comp] of Object.entries(valorFrontend)) {
        if (!comp || typeof comp !== "object" || !esStringValido(comp.name)) {
          errores.push(`Complemento inválido en "${titulo}".`);
          continue;
        }
        const choiceDB = grupoDB.choices.find((c) => c.name === comp.name);
        if (!choiceDB) {
          errores.push(`"${comp.name}" no existe en "${titulo}".`);
          continue;
        }
        const qty = Number(comp.quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
          errores.push(`Cantidad inválida para "${comp.name}".`);
          continue;
        }
        totalComplementos += qty;
        precio += Number(choiceDB.price) * qty;
      }
      if (totalComplementos > grupoDB.maxSelectable) {
        errores.push(`"${titulo}" supera el máximo de ${grupoDB.maxSelectable} complementos.`);
      }
    }
  }

  return { precio, errores };
}

// ─── Push notification ───────────────────────────────────────────────────────

async function enviarNotificacionPush(token, pedido) {
  if (!token) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: token,
        title: "🍽️ Nuevo pedido",
        body: `${pedido.cliente.nombre} · $${pedido.total}`,
        sound: "default",
        priority: "high",
      }),
    });
    console.log("🔔 Push enviado a:", token);
  } catch (e) {
    console.error("Error enviando push:", e);
  }
}

// ─── Handler principal ───────────────────────────────────────────────────────

export async function POST(req) {
  try {
    let orderId = null;

    const body = await req.json();
    const { restaurantId, cliente, entrega, pago, items } = body;

    if (!esStringValido(restaurantId)) {
      return NextResponse.json({ ok: false, error: "restaurantId inválido." }, { status: 400 });
    }

    const errorCliente = validarCliente(cliente);
    if (errorCliente) return NextResponse.json({ ok: false, error: errorCliente }, { status: 400 });

    const errorEntrega = validarEntrega(entrega);
    if (errorEntrega) return NextResponse.json({ ok: false, error: errorEntrega }, { status: 400 });

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "El pedido no tiene items." }, { status: 400 });
    }

    const restauranteSnap = await db.collection("restaurants").doc(restaurantId).get();
    if (!restauranteSnap.exists) {
      return NextResponse.json({ ok: false, error: "Restaurante no encontrado." }, { status: 404 });
    }
    const restaurante = restauranteSnap.data();

    if (!estaAbierto(restaurante)) {
      return NextResponse.json({ ok: false, error: "El restaurante está cerrado en este momento." }, { status: 400 });
    }

    const metodoPago = pago?.metodo;
    if (!["efectivo", "transferencia", "tarjeta"].includes(metodoPago)) {
      return NextResponse.json({ ok: false, error: "Método de pago inválido." }, { status: 400 });
    }

    if (metodoPago === "efectivo" && !restaurante.paymentMethods?.cash) {
      return NextResponse.json({ ok: false, error: "Efectivo no habilitado en este restaurante." }, { status: 400 });
    }
    if (metodoPago === "transferencia" && !restaurante.paymentMethods?.transfer?.enabled) {
      return NextResponse.json({ ok: false, error: "Transferencia no habilitada en este restaurante." }, { status: 400 });
    }
    if (metodoPago === "tarjeta" && !restaurante.paymentMethods?.card) {
      return NextResponse.json({ ok: false, error: "Tarjeta no habilitada en este restaurante." }, { status: 400 });
    }

    let totalBackend = 0;

    for (const item of items) {
      if (!esStringValido(item.productId)) {
        return NextResponse.json({ ok: false, error: "productId inválido." }, { status: 400 });
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        return NextResponse.json({ ok: false, error: `Cantidad inválida en producto ${item.productId}.` }, { status: 400 });
      }

      const productoSnap = await db.collection("products").doc(item.productId).get();
      if (!productoSnap.exists) {
        return NextResponse.json({ ok: false, error: `Producto ${item.productId} no encontrado.` }, { status: 404 });
      }

      const productoDB = productoSnap.data();

      if (productoDB.restaurantId !== restaurantId) {
        return NextResponse.json({ ok: false, error: `Producto ${item.productId} no pertenece a este restaurante.` }, { status: 400 });
      }

      if (!productoDB.stock) {
        return NextResponse.json({ ok: false, error: `"${productoDB.name}" no está disponible.` }, { status: 400 });
      }

      const { precio, errores } = calcularPrecioItem(productoDB, item);

      console.log(`🧮 ${productoDB.name} — precio unitario: ${precio}, qty: ${qty}, subtotal: ${precio * qty}`);

      if (errores.length > 0) {
        return NextResponse.json({ ok: false, error: errores[0] }, { status: 400 });
      }

      totalBackend += Number(precio) * qty;
    }

    console.log("🧾 Total backend calculado:", totalBackend);
    console.log("📤 Total recibido del frontend:", body.total);

    if (metodoPago === "efectivo") {
      const cambio = Number(pago.cambio);
      if (isNaN(cambio) || cambio < 0) {
        return NextResponse.json({ ok: false, error: "Cambio inválido." }, { status: 400 });
      }
      if (cambio < totalBackend) {
        return NextResponse.json({ ok: false, error: "El cambio es menor al total del pedido." }, { status: 400 });
      }
    }

    if (body.total !== totalBackend) {
      console.warn(`⚠️ Total no coincide — frontend: $${body.total}, backend: $${totalBackend}`);
      return NextResponse.json({ ok: false, error: "El total del pedido no coincide." }, { status: 400 });
    }

    console.log("✅ Pedido válido — total:", totalBackend);

    let clientSecret = null;
    let paymentIntentId = null;

    if (metodoPago === "tarjeta" && !restaurante.stripeAccountId) {
      return NextResponse.json({ ok: false, error: "Este restaurante no tiene pagos con tarjeta configurados." }, { status: 400 });
    }

    const pedidoCompleto = {
      restaurantId,
      cliente: {
        nombre: cliente.nombre.trim(),
        telefono: cliente.telefono.trim(),
      },
      entrega:
        entrega.tipo === "domicilio"
          ? {
              tipo: "domicilio",
              calle: entrega.calle.trim(),
              numero: entrega.numero.trim(),
              colonia: entrega.colonia.trim(),
              postal: entrega.postal.trim(),
            }
          : { tipo: "local" },
      pago: {
        metodo: metodoPago,
        ...(metodoPago === "efectivo" && {
          pagaCon: Number(pago.cambio),
          cambio: Number(pago.cambio) - totalBackend,
        }),
      },
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        options: item.options,
        note: item.note || null,
      })),
      total: totalBackend,
    };

    if (metodoPago === "tarjeta") {
      const pedidoRef = await db.collection("orders").add({
        ...pedidoCompleto,
        status: "pendiente_pago",
        creadoEn: new Date(),
      });

      // 🔔 Push
      await enviarNotificacionPush(restaurante.expoPushToken, pedidoCompleto);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalBackend * 100),
        currency: "mxn",
        automatic_payment_methods: { enabled: true },
        metadata: {
          restaurantId,
          orderId: pedidoRef.id,
        },
      });

      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;
    }

    if (metodoPago === "efectivo" || metodoPago === "transferencia") {
      const pedidoRef = await db.collection("orders").add({
        ...pedidoCompleto,
        status: "preparando",
        creadoEn: new Date(),
      });

      orderId = pedidoRef.id;

      // 🔔 Push
      await enviarNotificacionPush(restaurante.expoPushToken, pedidoCompleto);

      console.log(`📦 Pedido ${pedidoRef.id} guardado — método: ${metodoPago}`);
    }

    return NextResponse.json(
      {
        ok: true,
        message: metodoPago === "tarjeta" ? "Pago preparado" : "Pedido recibido",
        total: totalBackend,
        orderId,
        payment: metodoPago === "tarjeta" ? { clientSecret, paymentIntentId } : null,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Error en /api/orders:", err);
    return NextResponse.json({ ok: false, error: "Error interno del servidor." }, { status: 500 });
  }
}