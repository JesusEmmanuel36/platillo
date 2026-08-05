import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdmin } from "@/lib/admin-auth";
import { getPanelSession } from "@/lib/panel-auth";

function getHostname(host) {
  return host.split(":")[0].toLowerCase();
}

function isPanelHostname(hostname) {
  return (
    hostname === "panel.platillo.mx" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

export default async function LoginLayout({
  children,
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = getHostname(host);

  const cookieStore = await cookies();

  // Sesión del administrador.
  if (hostname === "admin.platillo.mx") {
    const adminToken =
      cookieStore.get("admin_token")?.value;

    if (adminToken) {
      const result =
        await verifySuperAdmin(adminToken);

      if (result.ok) {
        redirect("/");
      }
    }
  }

  // Sesión del restaurante.
  if (isPanelHostname(hostname)) {
    const session = await getPanelSession();

    if (session) {
      redirect("/");
    }
  }

  return children;
}