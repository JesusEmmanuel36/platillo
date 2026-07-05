import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTO_REPLY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

let geminiClient = null;

/**
 * Gemini se inicializa solamente cuando el restaurante
 * tiene whatsapp.mode = "ai".
 */
function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: getRequiredEnv("GEMINI_API_KEY"),
    });
  }

  return geminiClient;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

/**
 * Normaliza un número telefónico para usarlo como ID
 * del documento en Firestore.
 */
function normalizePhoneNumber(phoneNumber) {
  return String(phoneNumber || "").replace(/\D/g, "");
}

/**
 * Convierte un Timestamp de Firestore a milisegundos.
 */
function timestampToMilliseconds(timestamp) {
  if (!timestamp) {
    return 0;
  }

  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().getTime();
  }

  return 0;
}

/**
 * Normaliza texto para detectar frases aunque tengan acentos.
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Detecta cuando un cliente quiere hacer un pedido.
 * Se utiliza solamente en el modo con IA.
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
    console.log(
      "WhatsApp está desactivado para este restaurante",
    );

    return null;
  }

  if (!restaurantData?.name || !restaurantData?.slug) {
    console.error(
      "El restaurante no tiene name o slug:",
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
 * Determina si debe enviarse la autorrespuesta.
 *
 * La transacción evita que dos mensajes recibidos casi
 * simultáneamente generen dos enlaces.
 */
async function claimAutomaticMenuReply({
  customerPhone,
  customerName,
  incomingMessageId,
  restaurant,
}) {
  const normalizedPhone =
    normalizePhoneNumber(customerPhone);

  if (!normalizedPhone) {
    throw new Error(
      "No se pudo normalizar el teléfono del cliente",
    );
  }

  const autoReplyRef = db
    .collection("whatsappAutoReplies")
    .doc(normalizedPhone);

  return db.runTransaction(async (transaction) => {
    const snapshot =
      await transaction.get(autoReplyRef);

    const existingData = snapshot.data() || {};
    const now = Timestamp.now();
    const nowMilliseconds = now.toMillis();

    const sameRestaurant =
      existingData.lastRestaurantId === restaurant.id;

    const lastSentMilliseconds =
      timestampToMilliseconds(
        existingData.lastMenuLinkSentAt,
      );

    const cooldownIsActive =
      sameRestaurant &&
      lastSentMilliseconds > 0 &&
      nowMilliseconds - lastSentMilliseconds <
        AUTO_REPLY_COOLDOWN_MS;

    const commonData = {
      customerPhone: normalizedPhone,
      customerName: customerName || null,

      lastRestaurantId: restaurant.id,
      lastRestaurantName: restaurant.name,
      lastRestaurantSlug: restaurant.slug,

      lastIncomingMessageId:
        incomingMessageId || null,
      lastIncomingMessageAt: now,

      updatedAt: now,
    };

    if (!snapshot.exists) {
      commonData.createdAt = now;
    }

    /*
     * Aunque siga en cooldown, actualizamos la información
     * del último mensaje recibido.
     */
    if (cooldownIsActive) {
      transaction.set(
        autoReplyRef,
        commonData,
        {
          merge: true,
        },
      );

      return {
        shouldSend: false,
        autoReplyRef,
      };
    }

    /*
     * Reservamos el envío dentro de la transacción.
     * Así otro mensaje simultáneo verá el cooldown activo.
     */
    transaction.set(
      autoReplyRef,
      {
        ...commonData,
        lastMenuLinkSentAt: now,
        lastAutoReplyStatus: "pending",
      },
      {
        merge: true,
      },
    );

    return {
      shouldSend: true,
      autoReplyRef,
    };
  });
}

/**
 * Marca que el enlace se envió correctamente.
 */
async function markAutomaticReplyAsSent({
  autoReplyRef,
  whatsappMessageId,
}) {
  const now = Timestamp.now();

  await autoReplyRef.set(
    {
      lastMenuLinkSentAt: now,
      lastAutoReplyStatus: "sent",
      lastOutgoingMessageId:
        whatsappMessageId || null,
      lastAutoReplyError: null,
      updatedAt: now,
    },
    {
      merge: true,
    },
  );
}

/**
 * Si WhatsApp no pudo aceptar el mensaje, eliminamos
 * el cooldown para que pueda intentarse nuevamente.
 */
async function markAutomaticReplyAsFailed({
  autoReplyRef,
  error,
}) {
  const now = Timestamp.now();

  await autoReplyRef.set(
    {
      lastMenuLinkSentAt: null,
      lastAutoReplyStatus: "failed",
      lastAutoReplyError:
        error instanceof Error
          ? error.message
          : String(error),
      lastAutoReplyErrorAt: now,
      updatedAt: now,
    },
    {
      merge: true,
    },
  );
}

/**
 * Construye el mensaje automático del plan sin IA.
 */
function generateAutomaticMenuMessage(restaurant) {
  const menuUrl =
    `https://pide.platillo.mx/${restaurant.slug}`;

  return `👋 ¡Hola! Gracias por contactarnos.

📲 Ya puedes hacer tu pedido de forma rápida y sencilla desde nuestro menú en línea:

${menuUrl}

🍔 Elige tus productos
🧀 Personalízalos a tu gusto
💳 Consulta el total al momento

¡Te esperamos!`;
}

/**
 * Meta usa esta petición para verificar el webhook.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token =
    searchParams.get("hub.verify_token");
  const challenge =
    searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN;

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
 */
async function sendWhatsAppMessage(
  recipientPhone,
  message,
  businessPhoneNumberId,
) {
  const accessToken =
    getRequiredEnv("WHATSAPP_TOKEN");

  const phoneNumberId =
    businessPhoneNumberId ||
    getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

  const graphVersion =
    process.env.META_GRAPH_API_VERSION ||
    "v25.0";

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
 * Respuesta directa para pedidos en el modo con IA.
 */
function generateOrderReply(restaurant) {
  const orderUrl =
    `https://pide.platillo.mx/${restaurant.slug}`;

  return `¡Claro! Puedes hacer tu pedido en ${restaurant.name} desde este enlace:\n\n${orderUrl}`;
}

/**
 * Genera una respuesta general con Gemini.
 */
async function generateGeminiReply(
  customerMessage,
  restaurant,
) {
  const orderUrl =
    `https://pide.platillo.mx/${restaurant.slug}`;

  const gemini = getGeminiClient();

  const response =
    await gemini.models.generateContent({
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
- Cuando compartas el enlace, usa únicamente: ${orderUrl}
- No cambies ni inventes otro enlace.
        `.trim(),
        temperature: 0.7,
        maxOutputTokens: 350,
      },
    });

  const text = response.text?.trim();

  if (!text) {
    return "¿En qué puedo ayudarte?";
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
         * Los estados sent, delivered, read o failed
         * no contienen value.messages.
         */
        if (messages.length === 0) {
          continue;
        }

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

          continue;
        }

        const whatsappMode =
          restaurant?.whatsapp?.mode;

        if (
          !["auto_reply", "ai"].includes(
            whatsappMode,
          )
        ) {
          console.error(
            "El restaurante no tiene un modo válido:",
            {
              restaurantId: restaurant.id,
              whatsappMode,
            },
          );

          continue;
        }

        console.log("Restaurante asociado:", {
          restaurantId: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          whatsappMode,
          phoneNumberId: businessPhoneNumberId,
        });

        for (const incomingMessage of messages) {
          const senderPhone =
            incomingMessage?.from;
          const messageType =
            incomingMessage?.type;
          const messageId =
            incomingMessage?.id;

          if (!senderPhone) {
            continue;
          }

          const customerName =
            value?.contacts?.find(
              (contact) =>
                contact?.wa_id === senderPhone,
            )?.profile?.name || null;

          console.log("Mensaje entrante:", {
            senderPhone,
            customerName,
            messageType,
            messageId,
            whatsappMode,
          });

          /*
           * MODO SIN IA:
           * Responde al primer mensaje del cliente y luego
           * aplica el cooldown de 24 horas.
           */
          if (whatsappMode === "auto_reply") {
            const {
              shouldSend,
              autoReplyRef,
            } = await claimAutomaticMenuReply({
              customerPhone: senderPhone,
              customerName,
              incomingMessageId: messageId,
              restaurant,
            });

            if (!shouldSend) {
              console.log(
                "Autorrespuesta omitida por cooldown:",
                {
                  senderPhone,
                  restaurantId: restaurant.id,
                },
              );

              continue;
            }

            const automaticMessage =
              generateAutomaticMenuMessage(
                restaurant,
              );

            try {
              const sendResult =
                await sendWhatsAppMessage(
                  senderPhone,
                  automaticMessage,
                  businessPhoneNumberId,
                );

              await markAutomaticReplyAsSent({
                autoReplyRef,
                whatsappMessageId:
                  sendResult?.messages?.[0]?.id ||
                  null,
              });

              console.log(
                "Enlace automático enviado:",
                {
                  senderPhone,
                  restaurantId: restaurant.id,
                  slug: restaurant.slug,
                },
              );
            } catch (error) {
              await markAutomaticReplyAsFailed({
                autoReplyRef,
                error,
              });

              throw error;
            }

            continue;
          }

          /*
           * MODO CON IA:
           */
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

          if (
            wantsToPlaceOrder(customerMessage)
          ) {
            reply =
              generateOrderReply(restaurant);
          } else {
            reply =
              await generateGeminiReply(
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

    return NextResponse.json({
      received: true,
      error: true,
    });
  }
}