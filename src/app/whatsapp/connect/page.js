import { createHash } from "crypto";
import { db } from "@/lib/firebase-admin";
import ConnectWhatsAppClient from "./ConnectWhatsAppClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function ErrorPage({ title, description }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            backgroundColor: "#ffffff",
            color: "#d21616",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          !
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 24,
            color: "#111",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "12px 0 0",
            color: "#737373",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      </section>
    </main>
  );
}

export default async function WhatsAppConnectPage({ searchParams }) {
  const params = await searchParams;
  const token = String(params?.token || "").trim();

  if (!token) {
    return (
      <ErrorPage
        title="Enlace inválido"
        description="Este enlace no contiene una sesión válida de conexión."
      />
    );
  }

  const tokenHash = hashToken(token);

  const sessionRef = db
    .collection("whatsappConnectSessions")
    .doc(tokenHash);

  const sessionSnapshot = await sessionRef.get();

  if (!sessionSnapshot.exists) {
    return (
      <ErrorPage
        title="Enlace no encontrado"
        description="Este enlace no existe, venció o ya no está disponible."
      />
    );
  }

  const session = sessionSnapshot.data();

  const expirationMilliseconds =
    typeof session?.expiresAt?.toMillis === "function"
      ? session.expiresAt.toMillis()
      : 0;

  const expired =
    !expirationMilliseconds ||
    expirationMilliseconds <= Date.now();

  if (expired) {
    return (
      <ErrorPage
        title="El enlace venció"
        description="Regresa a la app de Platillo y genera un enlace nuevo."
      />
    );
  }

  if (session?.used === true || session?.status === "completed") {
    return (
      <ErrorPage
        title="Enlace utilizado"
        description="Esta conexión ya fue completada. Puedes revisar el estado desde la app de Platillo."
      />
    );
  }

  if (!session?.restaurantId) {
    return (
      <ErrorPage
        title="Sesión incompleta"
        description="No pudimos identificar el restaurante asociado a este enlace."
      />
    );
  }

  const restaurantSnapshot = await db
    .collection("restaurants")
    .doc(session.restaurantId)
    .get();

  if (!restaurantSnapshot.exists) {
    return (
      <ErrorPage
        title="Restaurante no encontrado"
        description="El restaurante asociado a esta conexión ya no existe."
      />
    );
  }

  const restaurant = restaurantSnapshot.data();

  return (
    <ConnectWhatsAppClient
      token={token}
      restaurantName={restaurant?.name || "tu negocio"}
    />
  );
}