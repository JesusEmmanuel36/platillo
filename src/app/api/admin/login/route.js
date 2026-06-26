import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SUPER_ADMIN_UIDS = (process.env.SUPER_ADMIN_UIDS || process.env.SUPER_ADMIN_UID || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

export async function POST(req) {
  const host = req.headers.get("host");
  if (host !== "admin.platillo.mx") {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ ok: false, reason: "no_token" }, { status: 400 });
  }

  try {
    // Verificar el ID token y sacar el UID
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    if (!SUPER_ADMIN_UIDS.includes(uid)) {
      return NextResponse.json({ ok: false, reason: "not_superadmin" }, { status: 401 });
    }

    // Crear session cookie de 7 días
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 días en ms
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días en segundos
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("Error en login admin:", e);
    return NextResponse.json({ ok: false, reason: "invalid_token" }, { status: 401 });
  }
}