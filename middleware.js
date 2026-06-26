import { NextResponse } from "next/server";

const REAL_ROUTES = ["/", "/gordo"];

export function middleware(req) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;

  // Permitir APIs siempre
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  if (host === "admin.platillo.mx") {
    // Login siempre público
    if (pathname === "/login") return NextResponse.next();

    // Verificar cookie de sesión
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // ─── platillo.mx ─────────────────────────────────────────────────────────
  const isMainDomain = host === "platillo.mx";
  if (!isMainDomain) return NextResponse.next();

  if (REAL_ROUTES.includes(pathname)) return NextResponse.next();

  return NextResponse.redirect(new URL("https://platillo.mx", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};