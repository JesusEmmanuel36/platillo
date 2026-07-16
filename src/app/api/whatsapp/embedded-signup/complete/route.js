import crypto from "crypto";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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

async function exchangeCodeForAccessToken(code) {
  const appId = getRequiredEnv("META_APP_ID");
  const appSecret = getRequiredEnv("META_APP_SECRET");
  const graphVersion =
    process.env.META_GRAPH_API_VERSION || "v25.0";

  const url = new URL(
    `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
  );

  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || !data?.access_token) {
    console.error("Error intercambiando code de Meta:", data);

    throw new Error(
      data?.error?.message ||
        "Meta no devolvió un token de acceso válido.",
    );
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
  };
}

async function subscribeAppToWaba({
  wabaId,
  accessToken,
}) {
  const graphVersion =
    process.env.META_GRAPH_API_VERSION || "v25.0";

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(
      wabaId,
    )}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok || data?.success !== true) {
    console.error("Error suscribiendo WABA al webhook:", data);

    throw new Error(
      data?.error?.message ||
        "No se pudo suscribir la cuenta de WhatsApp al webhook.",
    );
  }

  return data;
}

async function getPhoneNumberInformation({
  phoneNumberId,
  accessToken,
}) {
  const graphVersion =
    process.env.META_GRAPH_API_VERSION || "v25.0";

  const fields = [
    "display_phone_number",
    "verified_name",
    "quality_rating",
    "platform_type",
  ].join(",");

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(
      phoneNumberId,
    )}?fields=${encodeURIComponent(fields)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "No se pudo consultar información del número:",
      data,
    );

    /*
     * No detenemos toda la conexión solo porque Meta no
     * haya devuelto los detalles del número.
     */
    return null;
  }

  return data;
}

export async function POST(request) {
  let sessionRef = null;

  try {
    const body = await request.json();

    const token = String(body?.token || "").trim();
    const code = String(body?.code || "").trim();
    const wabaId = String(body?.wabaId || "").trim();
    const phoneNumberId = String(
      body?.phoneNumberId || "",
    ).trim();

    const businessId = body?.businessId
      ? String(body.businessId).trim()
      : null;

    if (!token || !code || !wabaId || !phoneNumberId) {
      return NextResponse.json(
        {
          error:
            "Faltan datos necesarios para completar la conexión.",
        },
        {
          status: 400,
        },
      );
    }

    const tokenHash = hashToken(token);

    sessionRef = db
      .collection("whatsappConnectSessions")
      .doc(tokenHash);

    /*
     * Primero reclamamos la sesión dentro de una transacción.
     * Así evitamos que dos solicitudes usen el mismo enlace
     * simultáneamente.
     */
    const session = await db.runTransaction(
      async (transaction) => {
        const sessionSnapshot =
          await transaction.get(sessionRef);

        if (!sessionSnapshot.exists) {
          throw new Error(
            "El enlace de conexión no existe o ya no es válido.",
          );
        }

        const sessionData = sessionSnapshot.data();

        const expirationMilliseconds =
          timestampToMilliseconds(sessionData?.expiresAt);

        if (
          !expirationMilliseconds ||
          expirationMilliseconds <= Date.now()
        ) {
          throw new Error(
            "El enlace de conexión venció. Genera uno nuevo desde la app.",
          );
        }

        if (
          sessionData?.used === true ||
          sessionData?.status === "completed"
        ) {
          throw new Error(
            "Este enlace de conexión ya fue utilizado.",
          );
        }

        if (sessionData?.status === "processing") {
          throw new Error(
            "Esta conexión ya se está procesando.",
          );
        }

        if (!sessionData?.restaurantId) {
          throw new Error(
            "La sesión no tiene un restaurante asociado.",
          );
        }

        transaction.update(sessionRef, {
          status: "processing",
          processingStartedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        return {
          restaurantId: sessionData.restaurantId,
          createdByUid:
            sessionData.createdByUid || null,
        };
      },
    );

    const restaurantRef = db
      .collection("restaurants")
      .doc(session.restaurantId);

    const restaurantSnapshot =
      await restaurantRef.get();

    if (!restaurantSnapshot.exists) {
      throw new Error(
        "El restaurante asociado ya no existe.",
      );
    }

    /*
     * 1. Intercambiamos el code por el token empresarial.
     */
    const { accessToken, tokenType } =
      await exchangeCodeForAccessToken(code);

    /*
     * 2. Suscribimos la app de Platillo a los webhooks
     *    de la WABA del restaurante.
     */
    await subscribeAppToWaba({
      wabaId,
      accessToken,
    });

    /*
     * 3. Consultamos el número para obtener el número
     *    visible que debe mostrarse en la app.
     */
    const phoneInformation =
      await getPhoneNumberInformation({
        phoneNumberId,
        accessToken,
      });

    const displayPhoneNumber =
      phoneInformation?.display_phone_number || null;

    const connectedAt = Timestamp.now();

    /*
     * 4. Guardamos la conexión respetando el mapa
     *    whatsapp que ya tienes en restaurants.
     */
    await restaurantRef.set(
      {
        whatsapp: {
          displayPhoneNumber,
          enabled: true,
          mode: "auto_reply",
          phoneNumberId,
          wabaId,

          businessId,
          accessToken,
          tokenType,

          connectionType: "coexistence",
          provider: "embedded_signup",
          status: "connected",
          webhookSubscribed: true,

          verifiedName:
            phoneInformation?.verified_name || null,
          qualityRating:
            phoneInformation?.quality_rating || null,
          platformType:
            phoneInformation?.platform_type || null,

          connectedByUid:
            session.createdByUid || null,
          connectedAt,
          updatedAt: connectedAt,
        },
      },
      {
        merge: true,
      },
    );

    /*
     * 5. Marcamos el enlace temporal como utilizado.
     */
    await sessionRef.set(
      {
        used: true,
        status: "completed",
        completedAt: connectedAt,
        updatedAt: connectedAt,

        connectedWabaId: wabaId,
        connectedPhoneNumberId: phoneNumberId,
        lastError: FieldValue.delete(),
        failedAt: FieldValue.delete(),
      },
      {
        merge: true,
      },
    );

    return NextResponse.json({
      ok: true,
      restaurantId: session.restaurantId,
      whatsapp: {
        displayPhoneNumber,
        phoneNumberId,
        wabaId,
        businessId,
        status: "connected",
      },
    });
  } catch (error) {
    console.error(
      "Error completando Embedded Signup:",
      error,
    );

    /*
     * Si algo falla después de reclamar la sesión,
     * la devolvemos a pending para que el dueño pueda
     * intentar otra vez mientras el enlace siga vigente.
     */
    if (sessionRef) {
      try {
        await sessionRef.set(
          {
            status: "pending",
            used: false,
            lastError:
              error instanceof Error
                ? error.message
                : String(error),
            failedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            processingStartedAt: FieldValue.delete(),
          },
          {
            merge: true,
          },
        );
      } catch (sessionError) {
        console.error(
          "No se pudo actualizar la sesión fallida:",
          sessionError,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la conexión de WhatsApp.";

    const clientErrors = [
      "no existe",
      "venció",
      "ya fue utilizado",
      "ya se está procesando",
      "no tiene un restaurante",
      "ya no existe",
    ];

    const isClientError = clientErrors.some((text) =>
      message.toLowerCase().includes(text),
    );

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: isClientError ? 400 : 500,
      },
    );
  }
}