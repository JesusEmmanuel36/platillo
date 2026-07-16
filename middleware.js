import { NextResponse } from "next/server";

const REAL_ROUTES = ["/", "/gordo", "/privacy", "/terms"];

function isLocalDevHost(host) {
  return (
    process.env.NODE_ENV !== "production" &&
    (host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))
  );
}

function isAdminHost(host) {
  return host === "admin.platillo.mx" || isLocalDevHost(host);
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
  const { pathname, search } = req.nextUrl;

  // Permitir APIs siempre.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  if (isAdminHost(host)) {
    if (pathname === "/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", `${pathname}${search || ""}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ─── platillo.mx ─────────────────────────────────────────────────────────
  const isMainDomain =
    host === "platillo.mx" || host === "www.platillo.mx";

  if (!isMainDomain) {
    return NextResponse.next();
  }

  if (isAllowedMainRoute(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("https://platillo.mx", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};