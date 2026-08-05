import { NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebase-admin";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          ok: false,
          reason: "missing_token",
        },
        {
          status: 400,
        },
      );
    }

    // Verificar que el token realmente fue emitido por Firebase.
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Buscar el restaurante asociado al usuario.
    const restaurantSnapshot = await db
      .collection("restaurants")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (restaurantSnapshot.empty) {
      return NextResponse.json(
        {
          ok: false,
          reason: "restaurant_not_found",
        },
        {
          status: 403,
        },
      );
    }

    const restaurantDocument = restaurantSnapshot.docs[0];
    const restaurant = restaurantDocument.data();

    /*
     * Opcional: impedir el acceso a restaurantes suspendidos.
     * Puedes conservar este bloque porque ya manejas platformStatus.
     */
    if (restaurant?.platformStatus === "suspended") {
      return NextResponse.json(
        {
          ok: false,
          reason: "restaurant_suspended",
        },
        {
          status: 403,
        },
      );
    }

    // Crear cookie de sesión de Firebase para el panel web.
    const sessionCookie =
      await adminAuth.createSessionCookie(token, {
        expiresIn: SESSION_DURATION_MS,
      });

    const response = NextResponse.json({
      ok: true,
      restaurantId: restaurantDocument.id,
    });

    response.cookies.set({
      name: "panel_token",
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return response;
  } catch (error) {
    console.error("Error iniciando sesión en el panel:", error);

    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_token",
      },
      {
        status: 401,
      },
    );
  }
}