import { NextResponse } from "next/server";

const REAL_ROUTES = ["/", "/gordo"];

export function middleware(req) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;

  // Permitir APIs siempre
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Solo aplicar en platillo.mx
  const isMainDomain = host === "platillo.mx";

  if (!isMainDomain) {
    return NextResponse.next();
  }

  // Permitir rutas reales
  if (REAL_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Todo lo demás se redirige
  return NextResponse.redirect(new URL("https://platillo.mx", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};