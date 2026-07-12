import crypto from "crypto";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db, adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECT_SESSION_TTL_MINUTES = 15;

function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const idToken = authorization.replace("Bearer ", "").trim();

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Falta restaurantId" },
        { status: 400 },
      );
    }

    const restaurantRef = db.collection("restaurants").doc(restaurantId);
    const restaurantSnap = await restaurantRef.get();

    if (!restaurantSnap.exists) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 },
      );
    }

    const restaurant = restaurantSnap.data();

    /*
     * Aquí usamos uid porque en Platillo normalmente
     * el restaurante pertenece a un usuario por uid.
     */
    const ownerUid = restaurant?.uid;

    if (ownerUid !== decodedToken.uid) {
      return NextResponse.json(
        { error: "No tienes acceso a este restaurante" },
        { status: 403 },
      );
    }

    const token = createRandomToken();
    const tokenHash = hashToken(token);

    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      Date.now() + CONNECT_SESSION_TTL_MINUTES * 60 * 1000,
    );

    await db.collection("whatsappConnectSessions").doc(tokenHash).set({
      restaurantId,
      createdByUid: decodedToken.uid,
      status: "pending",
      used: false,
      createdAt: now,
      expiresAt,
    });

    const connectUrl = `https://platillo.mx/whatsapp/connect?token=${encodeURIComponent(
      token,
    )}`;

    return NextResponse.json({
      ok: true,
      connectUrl,
      expiresAt: expiresAt.toDate().toISOString(),
    });
  } catch (error) {
    console.error("Error creando sesión de WhatsApp:", error);

    return NextResponse.json(
      { error: "No se pudo crear el enlace temporal" },
      { status: 500 },
    );
  }
}
