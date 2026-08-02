"use client";

import { useEffect, useRef, useState } from "react";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;

const META_GRAPH_API_VERSION =
  process.env.NEXT_PUBLIC_META_GRAPH_API_VERSION || "v25.0";

function isAllowedFacebookOrigin(origin) {
  try {
    const hostname = new URL(origin).hostname;

    return hostname === "facebook.com" || hostname.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

function normalizeSignupData(data) {
  const eventData = data?.data || {};

  return {
    wabaId: eventData.waba_id || eventData.wabaId || null,

    phoneNumberId: eventData.phone_number_id || eventData.phoneNumberId || null,

    businessId: eventData.business_id || eventData.businessId || null,
  };
}

export default function ConnectWhatsAppClient({ token, restaurantName }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState("ready");
  const [errorMessage, setErrorMessage] = useState("");

  const authCodeRef = useRef(null);
  const signupDataRef = useRef(null);
  const completingRef = useRef(false);

  async function tryToCompleteSignup() {
    const authCode = authCodeRef.current;
    const signupData = signupDataRef.current;

    /*
     * El code y el evento de Embedded Signup pueden llegar
     * en diferente orden. Esperamos hasta tener ambos.
     *
     * phoneNumberId no es obligatorio aquí porque Meta puede
     * terminar con FINISH_ONLY_WABA. En ese caso, el backend
     * buscará el número mediante el wabaId.
     */
    if (!authCode || !signupData?.wabaId) {
      console.log("Esperando datos para completar Embedded Signup:", {
        hasAuthCode: Boolean(authCode),
        wabaId: signupData?.wabaId || null,
        phoneNumberId: signupData?.phoneNumberId || null,
        businessId: signupData?.businessId || null,
      });

      return;
    }

    if (completingRef.current) {
      console.log("La conexión ya se está guardando.");
      return;
    }

    completingRef.current = true;

    try {
      setConnecting(true);
      setStatus("saving");
      setErrorMessage("");

      console.log("Enviando Embedded Signup al backend:", {
        hasToken: Boolean(token),
        hasCode: Boolean(authCode),
        wabaId: signupData.wabaId,
        phoneNumberId: signupData.phoneNumberId || null,
        businessId: signupData.businessId || null,
      });

      const response = await fetch("/api/whatsapp/embedded-signup/complete", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          code: authCode,
          wabaId: signupData.wabaId,
          phoneNumberId: signupData.phoneNumberId || null,
          businessId: signupData.businessId || null,
        }),
      });

      const result = await response.json().catch(() => null);

      console.log("Respuesta de Embedded Signup complete:", {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `No se pudo conectar WhatsApp Business (${response.status}).`,
        );
      }

      setStatus("completed");
    } catch (error) {
      completingRef.current = false;

      console.error("Error completando la conexión:", error);

      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo terminar la conexión.",
      );
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    function initializeFacebookSdk() {
      if (!window.FB) {
        return;
      }

      window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: META_GRAPH_API_VERSION,
      });

      console.log("SDK de Facebook inicializado:", {
        appIdConfigured: Boolean(META_APP_ID),
        configIdConfigured: Boolean(META_CONFIG_ID),
        graphVersion: META_GRAPH_API_VERSION,
      });

      setSdkReady(true);
    }

    window.fbAsyncInit = initializeFacebookSdk;

    const existingScript = document.getElementById("facebook-jssdk");

    if (existingScript) {
      if (window.FB) {
        initializeFacebookSdk();
      }

      return;
    }

    const script = document.createElement("script");

    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onerror = () => {
      console.error("No se pudo cargar el SDK de Facebook.");

      setConnecting(false);
      setErrorMessage("No se pudo cargar la conexión con Meta.");
      setStatus("error");
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    function receiveEmbeddedSignupMessage(event) {
      if (!isAllowedFacebookOrigin(event.origin)) {
        return;
      }

      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          console.log("Mensaje no JSON recibido desde Facebook:", event.data);
          return;
        }
      }

      if (data?.type !== "WA_EMBEDDED_SIGNUP") {
        return;
      }

      console.log("Evento de Embedded Signup recibido:", {
        event: data.event || null,
        data: data.data || null,
      });

      const finishedEvents = [
        "FINISH",
        "FINISH_ONLY_WABA",
        "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
      ];

      if (finishedEvents.includes(data.event)) {
        const normalizedData = normalizeSignupData(data);

        signupDataRef.current = normalizedData;

        console.log("Embedded Signup finalizado:", {
          event: data.event,
          ...normalizedData,
        });

        tryToCompleteSignup();
        return;
      }

      if (data.event === "CANCEL") {
        console.warn("Embedded Signup cancelado:", {
          currentStep:
            data.data?.current_step || data.data?.currentStep || null,
        });

        setConnecting(false);
        setStatus("cancelled");
        return;
      }

      if (data.event === "ERROR") {
        const metaError =
          data.data?.error_message ||
          data.data?.errorMessage ||
          "Meta no pudo completar la conexión.";

        console.error("Error recibido desde Embedded Signup:", data);

        completingRef.current = false;
        setConnecting(false);
        setStatus("error");
        setErrorMessage(metaError);
      }
    }

    window.addEventListener("message", receiveEmbeddedSignupMessage);

    return () => {
      window.removeEventListener("message", receiveEmbeddedSignupMessage);
    };
  }, []);

  function launchWhatsAppSignup() {
    authCodeRef.current = null;
    signupDataRef.current = null;
    completingRef.current = false;

    setErrorMessage("");
    setStatus("connecting");

    if (!META_APP_ID || !META_CONFIG_ID) {
      console.error("Faltan variables públicas de Meta:", {
        hasAppId: Boolean(META_APP_ID),
        hasConfigId: Boolean(META_CONFIG_ID),
      });

      setStatus("error");
      setErrorMessage("Faltan las variables de configuración de Meta.");
      return;
    }

    if (!sdkReady || !window.FB) {
      setStatus("error");
      setErrorMessage("La conexión con Meta todavía no está lista.");
      return;
    }

    setConnecting(true);

    console.log("Iniciando WhatsApp Embedded Signup.");

    window.FB.login(
      (response) => {
        const code = response?.authResponse?.code || null;

        console.log("Facebook Login completado:", {
          hasCode: Boolean(code),
          status: response?.status || null,
          authResponseExists: Boolean(response?.authResponse),
        });

        if (!code) {
          setConnecting(false);
          setStatus("cancelled");
          return;
        }

        authCodeRef.current = code;

        tryToCompleteSignup();
      },
      {
        config_id: META_CONFIG_ID,
        auth_type: "rerequest",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: 3,
          featureType: "whatsapp_business_app_onboarding",
        },
      },
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          backgroundColor: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 16px 50px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            backgroundColor: "#e6f9ed",
            color: "#168c46",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          ✓
        </div>

        <p
          style={{
            margin: "0 0 6px",
            color: "#8e8e93",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.7,
          }}
        >
          Platillo
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: 28,
            color: "#111",
            lineHeight: 1.2,
          }}
        >
          Conecta WhatsApp Business
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.6,
            margin: "14px 0 0",
          }}
        >
          Conecta el número de WhatsApp Business de{" "}
          <strong>{restaurantName}</strong> para responder automáticamente a tus
          clientes desde Platillo.
        </p>

        <div
          style={{
            backgroundColor: "#f7f7f7",
            border: "1px solid #ededed",
            borderRadius: 14,
            padding: 16,
            marginTop: 22,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#333",
              lineHeight: 1.55,
              fontSize: 14,
            }}
          >
            Meta te pedirá iniciar sesión, seleccionar tu negocio y confirmar el
            número que deseas conectar.
          </p>
        </div>

        {status === "completed" ? (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              backgroundColor: "#e8f8ed",
              color: "#237a3c",
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            WhatsApp Business se conectó correctamente.
            <br />
            Ya puedes regresar a la app de Platillo.
          </div>
        ) : (
          <button
            type="button"
            onClick={launchWhatsAppSignup}
            disabled={connecting || !sdkReady}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 14,
              padding: "15px 18px",
              marginTop: 22,
              backgroundColor: "#25D366",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: connecting || !sdkReady ? "not-allowed" : "pointer",
              opacity: connecting || !sdkReady ? 0.6 : 1,
            }}
          >
            {!sdkReady
              ? "Cargando conexión..."
              : connecting
                ? status === "saving"
                  ? "Guardando conexión..."
                  : "Conectando..."
                : "Conectar WhatsApp Business"}
          </button>
        )}

        {status === "cancelled" && (
          <p
            style={{
              color: "#8e8e93",
              textAlign: "center",
              margin: "14px 0 0",
              fontSize: 13,
            }}
          >
            La conexión fue cancelada. Puedes intentarlo nuevamente.
          </p>
        )}

        {status === "error" && (
          <p
            style={{
              color: "#d21616",
              backgroundColor: "#fff0f0",
              borderRadius: 12,
              padding: 12,
              margin: "14px 0 0",
              fontSize: 13,
            }}
          >
            {errorMessage}
          </p>
        )}

        <p
          style={{
            color: "#999",
            fontSize: 12,
            lineHeight: 1.5,
            margin: "18px 0 0",
            textAlign: "center",
          }}
        >
          Este enlace es temporal y solamente permite conectar el restaurante
          que lo generó.
        </p>
      </section>
    </main>
  );
}
