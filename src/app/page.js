import { headers } from "next/headers";
import LandingClient from "./LandingClient";
import AdminDashboard from "@/components/AdminDashboard";
import { requireSuperAdmin } from "@/lib/require-super-admin";

function isLocalDevHost(host) {
  return (
    process.env.NODE_ENV !== "production" &&
    (host.startsWith("localhost:") || host.startsWith("127.0.0.1:"))
  );
}

function isAdminHost(host) {
  return host === "admin.platillo.mx" || isLocalDevHost(host);
}

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (isAdminHost(host)) {
    return {
      title: {
        absolute: "Admin - Platillo",
      },
      description: "Panel interno de administración de Platillo",
    };
  }

  return {
    title: {
      absolute: "Platillo | Pedidos sin comisiones",
    },
    description: "Sistema de pedidos para restaurantes sin comisiones por pedido.",
  };
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (isAdminHost(host)) {
    const session = await requireSuperAdmin();

    if (session?.denied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--red-text-color)]">
              Acceso denegado
            </p>
            <p className="text-sm text-[var(--gray-color)] mt-1">
              Tu cuenta no tiene permisos de superadmin.
            </p>
          </div>
        </div>
      );
    }

    return <AdminDashboard />;
  }

  return <LandingClient />;
}