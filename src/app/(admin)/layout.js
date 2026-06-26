import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySuperAdmin } from "@/lib/admin-auth";

export const metadata = {
  title: {
    absolute: "Admin - Platillo",
  },
  description: "Inicio de sesión del panel interno de Platillo",
};

export default async function LoginLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_token")?.value;

  if (sessionCookie) {
    const result = await verifySuperAdmin(sessionCookie);

    if (result.ok) {
      redirect("/");
    }
  }

  return children;
}