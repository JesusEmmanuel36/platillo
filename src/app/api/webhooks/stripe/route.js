import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature inválida:", err.message);
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }

  const intent = event.data.object;

  switch (event.type) {
    case "payment_intent.succeeded": {
      const orderId = intent.metadata?.orderId;
      if (!orderId) {
        console.error("❌ No hay orderId en metadata.");
        break;
      }

      await db.collection("orders").doc(orderId).update({
        status: "preparando",
        paymentIntentId: intent.id,
        pagadoEn: new Date(),
      });

      console.log(`✅ Pedido ${orderId} marcado como pagado.`);
      break;
    }

    case "payment_intent.payment_failed": {
      const orderId = intent.metadata?.orderId;
      if (!orderId) break;

      await db
        .collection("orders")
        .doc(orderId)
        .update({
          status: "pago_fallido",
          errorPago: intent.last_payment_error?.message || "Error desconocido",
        });

      console.log(`❌ Pedido ${orderId} — pago fallido.`);
      break;
    }

    case "payment_intent.canceled": {
      const orderId = intent.metadata?.orderId;
      if (!orderId) break;

      await db.collection("orders").doc(orderId).update({
        status: "cancelado",
      });

      console.log(`⚠️ Pedido ${orderId} cancelado.`);
      break;
    }

    default:
      console.log("ℹ️ Evento no manejado:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
