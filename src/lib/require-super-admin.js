import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdmin } from "@/lib/admin-auth";

export async function requireSuperAdmin() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host !== "admin.platillo.mx") return null;

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