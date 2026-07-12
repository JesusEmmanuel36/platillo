"use client";

import { useEffect, useRef, useState } from "react";

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const META_CONFIG_ID =
  process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;

const META_GRAPH_API_VERSION =
  process.env.META_GRAPH_API_VERSION || "v25.0";

export default function ConnectWhatsAppClient({
  token,
  restaurantName,
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState("ready");
  const [errorMessage, setErrorMessage] = useState("");

  const authCodeRef = useRef(null);
  const signupDataRef = useRef(null);

  useEffect(() => {
    function initializeFacebookSdk() {
      if (!window.FB) return;

      window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: META_GRAPH_API_VERSION,
      });

      setSdkReady(true);
    }

    window.fbAsyncInit = initializeFacebookSdk;

    const existingScript = document.getElementById(
      "facebook-jssdk",
    );

    if (existingScript) {
      if (window.FB) {
        initializeFacebookSdk();
      }

      return;
    }

    const script = document.createElement("script");

    script.id = "facebook-jssdk";
    script.src =
      "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onerror = () => {
      setErrorMessage(
        "No se pudo cargar la conexión con Meta.",
      );
      setStatus("error");
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    function receiveEmbeddedSignupMessage(event) {
      const allowedOrigins = [
        "https://www.facebook.com",
        "https://web.facebook.com",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (data?.type !== "WA_EMBEDDED_SIGNUP") {
        return;
      }

      console.log("Evento de Embedded Signup:", data);

      if (
        data.event ===
          "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" ||
        data.event === "FINISH"
      ) {
        signupDataRef.current = {
          wabaId: data.data?.waba_id || null,
          phoneNumberId:
            data.data?.phone_number_id || null,
          businessId: data.data?.business_id || null,
        };

        tryToCompleteSignup();
        return;
      }

      if (data.event === "CANCEL") {
        setConnecting(false);
        setStatus("cancelled");
        return;
      }

      if (data.event === "ERROR") {
        console.error(
          "Error recibido desde Embedded Signup:",
          data,
        );

        setConnecting(false);
        setStatus("error");
        setErrorMessage(
          data.data?.error_message ||
            "Meta no pudo completar la conexión.",
        );
      }
    }

    window.addEventListener(
      "message",
      receiveEmbeddedSignupMessage,
    );

    return () => {
      window.removeEventListener(
        "message",
        receiveEmbeddedSignupMessage,
      );
    };
  }, []);

  function tryToCompleteSignup() {
    const authCode = authCodeRef.current;
    const signupData = signupDataRef.current;

    if (!authCode || !signupData?.phoneNumberId) {
      return;
    }

    /*
     * En el siguiente paso enviaremos estos datos al backend:
     *
     * POST /api/whatsapp/embedded-signup/complete
     *
     * {
     *   token,
     *   code: authCode,
     *   wabaId: signupData.wabaId,
     *   phoneNumberId: signupData.phoneNumberId,
     *   businessId: signupData.businessId
     * }
     */

    console.log("Embedded Signup completado:", {
      token,
      code: authCode,
      ...signupData,
    });

    setConnecting(false);
    setStatus("authorized");
  }

  function launchWhatsAppSignup() {
    setErrorMessage("");

    if (!META_APP_ID || !META_CONFIG_ID) {
      setStatus("error");
      setErrorMessage(
        "Faltan las variables de configuración de Meta.",
      );
      return;
    }

    if (!sdkReady || !window.FB) {
      setStatus("error");
      setErrorMessage(
        "La conexión con Meta todavía no está lista.",
      );
      return;
    }

    setConnecting(true);
    setStatus("connecting");

    window.FB.login(
      (response) => {
        console.log(
          "Respuesta de Facebook Login:",
          response,
        );

        const code = response?.authResponse?.code;

        if (!code) {
          setConnecting(false);

          if (status !== "authorized") {
            setStatus("cancelled");
          }

          return;
        }

        authCodeRef.current = code;
        tryToCompleteSignup();
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          sessionInfoVersion: "3",
          featureType:
            "whatsapp_business_app_onboarding",
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
          <strong>{restaurantName}</strong> para responder
          automáticamente a tus clientes desde Platillo.
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
            Meta te pedirá iniciar sesión, seleccionar tu
            negocio y confirmar el número que deseas conectar.
          </p>
        </div>

        {status === "authorized" ? (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              backgroundColor: "#e8f8ed",
              color: "#237a3c",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Autorización recibida correctamente
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
              cursor:
                connecting || !sdkReady
                  ? "not-allowed"
                  : "pointer",
              opacity:
                connecting || !sdkReady ? 0.6 : 1,
            }}
          >
            {!sdkReady
              ? "Cargando conexión..."
              : connecting
                ? "Conectando..."
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
            La conexión fue cancelada. Puedes intentarlo
            nuevamente.
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
          Este enlace es temporal y solamente permite conectar
          el restaurante que lo generó.
        </p>
      </section>
    </main>
  );
}