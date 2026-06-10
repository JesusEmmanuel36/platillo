import { NextResponse } from "next/server";

export function middleware(req) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;

  // SOLO proteger rutas de restaurante (no landing)
  const isRestaurantRoute = pathname.split("/").length > 2;

  if (host !== "pide.platillo.mx" && isRestaurantRoute) {
    return NextResponse.redirect(new URL("https://platillo.mx", req.url));
  }

  return NextResponse.next();
}
