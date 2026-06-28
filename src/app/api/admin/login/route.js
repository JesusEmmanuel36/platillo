import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SUPER_ADMIN_UIDS = (
  process.env.SUPER_ADMIN_UIDS ||
  process.env.SUPER_ADMIN_UID ||
  ""
)
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

function isLocalDevHost(host) {
  return (
    process.env.NODE_ENV !== "production" &&
    (host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))
  );
}

function isAllowedAdminHost(host) {
  return host === "admin.platillo.mx" || isLocalDevHost(host);
}

export async function POST(req) {
  const host = req.headers.get("host") || "";

  if (!isAllowedAdminHost(host)) {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { ok: false, reason: "no_token" },
      { status: 400 }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    if (!SUPER_ADMIN_UIDS.includes(uid)) {
      return NextResponse.json(
        { ok: false, reason: "not_superadmin" },
        { status: 401 }
      );
    }

    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 días en ms

    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn,
    });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("admin_token", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("Error en login admin:", e);

    return NextResponse.json(
      { ok: false, reason: "invalid_token" },
      { status: 401 }
    );
  }
}