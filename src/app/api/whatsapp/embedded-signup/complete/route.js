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

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v25.0";

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
    console.error(
      "Error intercambiando code de Meta:",
      data?.error?.message || data,
    );

    throw new Error(
      data?.error?.message || "Meta no devolvió un token de acceso válido.",
    );
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
  };
}

async function getSharedWabaIdsFromAccessToken(accessToken) {
  const systemUserAccessToken =
    process.env.META_SYSTEM_USER_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;

  if (!systemUserAccessToken) {
    throw new Error("Falta META_SYSTEM_USER_ACCESS_TOKEN o WHATSAPP_TOKEN");
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v25.0";

  const url = new URL(`https://graph.facebook.com/${graphVersion}/debug_token`);

  url.searchParams.set("input_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${systemUserAccessToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Error consultando debug_token de Meta:",
      data?.error?.message || data,
    );

    throw new Error(
      data?.error?.message ||
        "Meta no permitió consultar la cuenta de WhatsApp compartida.",
    );
  }

  if (data?.data?.is_valid !== true) {
    throw new Error("El token devuelto por Meta no es válido o ya venció.");
  }

  const granularScopes = Array.isArray(data?.data?.granular_scopes)
    ? data.data.granular_scopes
    : [];

  const targetIds = granularScopes
    .filter(
      (item) =>
        item?.scope === "whatsapp_business_management" &&
        Array.isArray(item?.target_ids),
    )
    .flatMap((item) => item.target_ids)
    .map((id) => String(id || "").trim())
    .filter(Boolean);

  return [...new Set(targetIds)];
}

async function subscribeAppToWaba({ wabaId, accessToken }) {
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v25.0";

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
    console.error(
      "Error suscribiendo WABA al webhook:",
      data?.error?.message || data,
    );

    throw new Error(
      data?.error?.message ||
        "No se pudo suscribir la cuenta de WhatsApp al webhook.",
    );
  }

  return data;
}

async function getPhoneNumberInformation({ phoneNumberId, accessToken }) {
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v25.0";

  const fields = [
    "id",
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
      data?.error?.message || data,
    );

    return null;
  }

  return data;
}

async function getPhoneNumbersFromWaba({ wabaId, accessToken }) {
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v25.0";

  const fields = [
    "id",
    "display_phone_number",
    "verified_name",
    "quality_rating",
  ].join(",");

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(
      wabaId,
    )}/phone_numbers?fields=${encodeURIComponent(fields)}`,
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
      "Error consultando números de la WABA:",
      data?.error?.message || data,
    );

    throw new Error(
      data?.error?.message ||
        "No se pudieron obtener los números de teléfono de la WABA.",
    );
  }

  return Array.isArray(data?.data) ? data.data : [];
}

export async function POST(request) {
  let sessionRef = null;
  let sessionClaimed = false;

  try {
    const body = await request.json();

    const token = String(body?.token || "").trim();

    const code = String(body?.code || "").trim();

    const wabaIdFromFrontend =
      body?.wabaId != null && String(body.wabaId).trim()
        ? String(body.wabaId).trim()
        : null;

    const phoneNumberIdRaw =
      body?.phoneNumberId != null ? String(body.phoneNumberId).trim() : null;

    const phoneNumberIdFromFrontend =
      phoneNumberIdRaw && phoneNumberIdRaw.length > 0 ? phoneNumberIdRaw : null;

    const businessId = body?.businessId ? String(body.businessId).trim() : null;

    console.log("Embedded Signup — inicio:", {
      hasWabaId: Boolean(wabaIdFromFrontend),
      hasPhoneNumberId: Boolean(phoneNumberIdFromFrontend),
    });

    /*
     * wabaId y phoneNumberId ya no son obligatorios.
     * Solo necesitamos el token temporal y el code de Meta.
     */
    if (!token || !code) {
      return NextResponse.json(
        {
          error:
            "Faltan el token temporal o el código de autorización de Meta.",
        },
        {
          status: 400,
        },
      );
    }

    const tokenHash = hashToken(token);

    sessionRef = db.collection("whatsappConnectSessions").doc(tokenHash);

    /*
     * Reclamamos la sesión dentro de una transacción para
     * evitar dos solicitudes simultáneas.
     */
    const session = await db.runTransaction(async (transaction) => {
      const sessionSnapshot = await transaction.get(sessionRef);

      if (!sessionSnapshot.exists) {
        throw new Error("El enlace de conexión no existe o ya no es válido.");
      }

      const sessionData = sessionSnapshot.data();

      const expirationMilliseconds = timestampToMilliseconds(
        sessionData?.expiresAt,
      );

      if (!expirationMilliseconds || expirationMilliseconds <= Date.now()) {
        throw new Error(
          "El enlace de conexión venció. Genera uno nuevo desde la app.",
        );
      }

      if (sessionData?.used === true || sessionData?.status === "completed") {
        throw new Error("Este enlace de conexión ya fue utilizado.");
      }

      if (sessionData?.status === "processing") {
        throw new Error("Esta conexión ya se está procesando.");
      }

      if (!sessionData?.restaurantId) {
        throw new Error("La sesión no tiene un restaurante asociado.");
      }

      transaction.update(sessionRef, {
        status: "processing",
        processingStartedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return {
        restaurantId: sessionData.restaurantId,
        createdByUid: sessionData.createdByUid || null,
      };
    });

    sessionClaimed = true;

    const restaurantRef = db
      .collection("restaurants")
      .doc(session.restaurantId);

    const restaurantSnapshot = await restaurantRef.get();

    if (!restaurantSnapshot.exists) {
      throw new Error("El restaurante asociado ya no existe.");
    }

    /*
     * 1. Intercambiamos el code por el accessToken
     * empresarial de Meta.
     */
    const { accessToken, tokenType } = await exchangeCodeForAccessToken(code);

    /*
     * 2. Resolvemos el WABA ID.
     *
     * Cuando el postMessage de Meta no llega, el frontend
     * envía wabaId como null. En ese caso recuperamos el ID
     * desde granular_scopes usando /debug_token.
     */
    let resolvedWabaId = wabaIdFromFrontend;

    if (!resolvedWabaId) {
      const sharedWabaIds = await getSharedWabaIdsFromAccessToken(accessToken);

      console.log(
        "WABAs encontradas mediante debug_token:",
        sharedWabaIds.length,
      );

      if (sharedWabaIds.length === 0) {
        throw new Error(
          "Meta no devolvió ninguna cuenta de WhatsApp Business compartida.",
        );
      }

      if (sharedWabaIds.length > 1) {
        throw new Error(
          "Meta devolvió varias cuentas de WhatsApp Business y no indicó cuál fue seleccionada.",
        );
      }

      resolvedWabaId = sharedWabaIds[0];
    }

    console.log("WABA resuelta para Embedded Signup:", resolvedWabaId);

    /*
     * 3. Suscribimos Platillo a los webhooks de la WABA.
     */
    await subscribeAppToWaba({
      wabaId: resolvedWabaId,
      accessToken,
    });

    /*
     * 4. Resolvemos el phoneNumberId.
     */
    let resolvedPhoneNumberId = null;

    let phoneInformation = null;

    if (phoneNumberIdFromFrontend) {
      console.log(
        "Usando phoneNumberId del frontend:",
        phoneNumberIdFromFrontend,
      );

      resolvedPhoneNumberId = String(phoneNumberIdFromFrontend);

      const info = await getPhoneNumberInformation({
        phoneNumberId: resolvedPhoneNumberId,
        accessToken,
      });

      if (info) {
        phoneInformation = info;
      }
    } else {
      console.log(
        "phoneNumberId no recibido — consultando números de la WABA:",
        resolvedWabaId,
      );

      const wabaNumbers = await getPhoneNumbersFromWaba({
        wabaId: resolvedWabaId,
        accessToken,
      });

      console.log("Números encontrados en la WABA:", wabaNumbers.length);

      if (wabaNumbers.length === 0) {
        throw new Error(
          "La cuenta de WhatsApp Business no tiene números de teléfono asociados.",
        );
      }

      if (wabaNumbers.length === 1) {
        const chosen = wabaNumbers[0];

        if (!chosen?.id) {
          throw new Error(
            "Meta devolvió un número de WhatsApp sin un identificador válido.",
          );
        }

        resolvedPhoneNumberId = String(chosen.id);

        phoneInformation = chosen;

        console.log(
          "Número seleccionado porque es el único de la WABA:",
          resolvedPhoneNumberId,
        );
      } else {
        throw new Error(
          "La cuenta de WhatsApp Business tiene varios números y Meta no indicó cuál fue seleccionado.",
        );
      }

      /*
       * Intentamos obtener información adicional del número.
       * Si falla, conservamos la información de la lista WABA.
       */
      const enriched = await getPhoneNumberInformation({
        phoneNumberId: resolvedPhoneNumberId,
        accessToken,
      });

      if (enriched) {
        phoneInformation = enriched;
      }
    }

    if (!resolvedPhoneNumberId) {
      throw new Error(
        "No se pudo determinar el número de teléfono de WhatsApp.",
      );
    }

    console.log("Número de WhatsApp resuelto:", resolvedPhoneNumberId);

    const displayPhoneNumber = phoneInformation?.display_phone_number || null;

    const connectedAt = Timestamp.now();

    /*
     * Evitamos que el mismo número quede conectado
     * simultáneamente a dos restaurantes.
     */
    const existingPhoneSnapshot = await db
      .collection("restaurants")
      .where("whatsapp.phoneNumberId", "==", resolvedPhoneNumberId)
      .limit(2)
      .get();

    const conflictingRestaurant = existingPhoneSnapshot.docs.find(
      (document) => document.id !== session.restaurantId,
    );

    if (conflictingRestaurant) {
      throw new Error(
        "Este número de WhatsApp ya está conectado a otro restaurante de Platillo.",
      );
    }

    const connectionRef = db
      .collection("whatsappConnections")
      .doc(session.restaurantId);

    const connectionSnapshot = await connectionRef.get();

    const restaurantWhatsappData = {
      displayPhoneNumber,

      enabled: true,
      status: "connected",
      mode: "auto_reply",

      phoneNumberId: resolvedPhoneNumberId,
      wabaId: resolvedWabaId,
      businessId,

      connectionType: "coexistence",
      provider: "embedded_signup",
      webhookSubscribed: true,

      verifiedName: phoneInformation?.verified_name || null,

      qualityRating: phoneInformation?.quality_rating || null,

      platformType: phoneInformation?.platform_type || null,

      connectedByUid: session.createdByUid || null,

      connectedAt,
      updatedAt: connectedAt,

      lastIncomingMessageAt: null,

      lastOutgoingMessageAt: null,

      lastActivityAt: null,
      lastError: null,
    };

    /*
     * Este documento contiene el accessToken privado.
     */
    const privateConnectionData = {
      restaurantId: session.restaurantId,

      accessToken,
      tokenType,

      phoneNumberId: resolvedPhoneNumberId,

      wabaId: resolvedWabaId,

      businessId,

      provider: "embedded_signup",

      connectionType: "coexistence",

      status: "connected",

      connectedByUid: session.createdByUid || null,

      updatedAt: connectedAt,
    };

    if (!connectionSnapshot.exists) {
      privateConnectionData.createdAt = connectedAt;
    }

    /*
     * Las tres escrituras se realizan juntas.
     */
    const batch = db.batch();

    batch.set(
      restaurantRef,
      {
        whatsapp: restaurantWhatsappData,
      },
      {
        merge: true,
      },
    );

    batch.set(connectionRef, privateConnectionData, {
      merge: true,
    });

    batch.set(
      sessionRef,
      {
        used: true,
        status: "completed",

        completedAt: connectedAt,
        updatedAt: connectedAt,

        connectedWabaId: resolvedWabaId,

        connectedPhoneNumberId: resolvedPhoneNumberId,

        lastError: FieldValue.delete(),

        failedAt: FieldValue.delete(),

        processingStartedAt: FieldValue.delete(),
      },
      {
        merge: true,
      },
    );

    await batch.commit();

    console.log("Embedded Signup completado:", {
      restaurantId: session.restaurantId,

      resolvedWabaId,

      resolvedPhoneNumberId,
    });

    return NextResponse.json({
      ok: true,

      restaurantId: session.restaurantId,

      whatsapp: {
        displayPhoneNumber,

        phoneNumberId: resolvedPhoneNumberId,

        wabaId: resolvedWabaId,

        businessId,

        status: "connected",
      },
    });
  } catch (error) {
    console.error(
      "Error completando Embedded Signup:",
      error instanceof Error ? error.message : error,
    );

    /*
     * Solamente restauramos la sesión cuando realmente
     * fue reclamada por esta solicitud.
     */
    if (sessionRef && sessionClaimed) {
      try {
        await sessionRef.set(
          {
            status: "pending",
            used: false,

            lastError: error instanceof Error ? error.message : String(error),

            failedAt: Timestamp.now(),

            updatedAt: Timestamp.now(),

            processingStartedAt: FieldValue.delete(),
          },
          {
            merge: true,
          },
        );
      } catch (sessionError) {
        console.error("No se pudo actualizar la sesión fallida:", sessionError);
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
      "ya está conectado",
      "no fue posible identificar",
      "no tiene números",
      "ninguna cuenta",
      "varias cuentas",
      "no es válido",
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
