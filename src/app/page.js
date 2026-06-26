import { headers } from "next/headers";
import LandingClient from "./LandingClient";
import AdminDashboard from "@/components/AdminDashboard";
import { requireSuperAdmin } from "@/lib/require-super-admin";

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host === "admin.platillo.mx") {
    const session = await requireSuperAdmin();

    if (session?.denied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--red-text-color)]">Acceso denegado</p>
            <p className="text-sm text-[var(--gray-color)] mt-1">Tu cuenta no tiene permisos de superadmin.</p>
          </div>
        </div>
      );
    }

    return <AdminDashboard />;
  }

  return <LandingClient />;
}