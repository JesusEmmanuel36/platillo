import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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
 * Meta usa esta petición para verificar el webhook.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
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
 */
async function sendWhatsAppMessage(recipientPhone, message) {
  const accessToken = getRequiredEnv("WHATSAPP_TOKEN");

  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v23.0";

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
          preview_url: false,
          body: message.slice(0, 4000),
        },
      }),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    console.error("Error de WhatsApp Cloud API:", responseBody);

    throw new Error(`Error enviando mensaje de WhatsApp: ${response.status}`);
  }

  return responseBody;
}

/**
 * Genera la respuesta usando Gemini 2.5 Flash.
 */
async function generateGeminiReply(customerMessage) {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: customerMessage,
    config: {
      systemInstruction: `
Eres el asistente virtual de prueba de Platillo.

Reglas:
- Responde de manera natural, amable y breve.
- Responde en español, salvo que el usuario use claramente otro idioma.
- Usa como máximo tres párrafos cortos.
- No digas que eres Gemini.
- Todavía no tienes acceso a menús, pedidos, precios ni información de restaurantes.
- No inventes información de restaurantes.
- Si preguntan por un menú o pedido, explica que esa función todavía está en desarrollo.
      `.trim(),
      temperature: 0.7,
      maxOutputTokens: 350,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    return "Lo siento, no pude generar una respuesta en este momento.";
  }

  return text;
}

/**
 * Recibe los mensajes entrantes de WhatsApp.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Webhook recibido:", JSON.stringify(body, null, 2));

    const entries = body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];

      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages || [];

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
            );

            continue;
          }

          const customerMessage = incomingMessage?.text?.body?.trim();

          if (!customerMessage) {
            continue;
          }

          const geminiReply = await generateGeminiReply(customerMessage);

          await sendWhatsAppMessage(senderPhone, geminiReply);
        }
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Error en webhook de WhatsApp:", error);

    /*
     * Devolvemos 200 para evitar que Meta reintente
     * constantemente durante las pruebas.
     */
    return NextResponse.json({
      received: true,
      error: true,
    });
  }
}
