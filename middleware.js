import { NextResponse } from "next/server";

const REAL_ROUTES = ["/", "/gordo", "/privacy", "/terms"];

function getHostname(host) {
  return host.split(":")[0].toLowerCase();
}

function isLocalDevHost(host) {
  const hostname = getHostname(host);

  return (
    process.env.NODE_ENV !== "production" &&
    (hostname === "localhost" || hostname === "127.0.0.1")
  );
}

function isAdminHost(host) {
  return getHostname(host) === "admin.platillo.mx";
}

function isPanelHost(host) {
  const hostname = getHostname(host);

  return (
    hostname === "panel.platillo.mx" ||
    isLocalDevHost(host)
  );
}

function isAllowedMainRoute(pathname) {
  return (
    REAL_ROUTES.includes(pathname) ||
    pathname === "/whatsapp" ||
    pathname.startsWith("/whatsapp/")
  );
}

export function middleware(req) {
  const host = req.headers.get("host") || "";
  const hostname = getHostname(host);
  const { pathname, search } = req.nextUrl;

  // Permitir las APIs en todos los dominios.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ─── Admin interno de Platillo ───────────────────────────────────────────
  if (isAdminHost(host)) {
    // La página /login decidirá mostrar AdminLogin.
    if (pathname === "/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);

      loginUrl.searchParams.set(
        "next",
        `${pathname}${search || ""}`,
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ─── Panel de restaurantes ───────────────────────────────────────────────
  if (isPanelHost(host)) {
    // panel.platillo.mx
    // → panel.platillo.mx/login
    //
    // localhost:3000
    // → localhost:3000/login
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL("/login", req.url),
      );
    }

    // La página /login decidirá mostrar RestaurantLogin.
    if (pathname === "/login") {
      return NextResponse.next();
    }

    /*
     * Más adelante aquí revisarás la sesión del restaurante:
     *
     * const panelToken =
     *   req.cookies.get("panel_token")?.value;
     *
     * if (!panelToken) {
     *   const loginUrl = new URL("/login", req.url);
     *   loginUrl.searchParams.set(
     *     "next",
     *     `${pathname}${search || ""}`,
     *   );
     *   return NextResponse.redirect(loginUrl);
     * }
     */

    return NextResponse.next();
  }

  // ─── Dominio principal platillo.mx ───────────────────────────────────────
  const isMainDomain =
    hostname === "platillo.mx" ||
    hostname === "www.platillo.mx";

  if (!isMainDomain) {
    return NextResponse.next();
  }

  if (isAllowedMainRoute(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL("https://platillo.mx", req.url),
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};