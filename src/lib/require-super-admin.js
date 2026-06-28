import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdmin } from "@/lib/admin-auth";

function isLocalDevHost(host) {
  return (
    process.env.NODE_ENV !== "production" &&
    (host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))
  );
}

function isAdminHost(host) {
  return host === "admin.platillo.mx" || isLocalDevHost(host);
}

export async function requireSuperAdmin() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Solo aplica en admin.platillo.mx en producción
  // y en localhost durante desarrollo.
  if (!isAdminHost(host)) return null;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_token")?.value;

  if (!sessionCookie) redirect("/login");

  const result = await verifySuperAdmin(sessionCookie);

  if (!result.ok) {
    if (result.reason === "not_superadmin") return { denied: true };
    redirect("/login");
  }

  return { uid: result.uid };
}