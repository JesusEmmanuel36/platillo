import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdmin } from "@/lib/admin-auth";

function getHostname(host) {
  return host.split(":")[0].toLowerCase();
}

export default async function LoginLayout({ children }) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = getHostname(host);

  const cookieStore = await cookies();

  // Sesión del administrador.
  if (hostname === "admin.platillo.mx") {
    const adminToken =
      cookieStore.get("admin_token")?.value;

    if (adminToken) {
      const result = await verifySuperAdmin(adminToken);

      if (result.ok) {
        redirect("/");
      }
    }
  }

  /*
   * Aquí agregarás después la comprobación de la sesión
   * del restaurante, por ejemplo con panel_token.
   */

  return children;
}