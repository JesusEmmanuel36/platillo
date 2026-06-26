import { headers } from "next/headers";
import LandingClient from "./LandingClient";
import { requireSuperAdmin } from "@/lib/require-super-admin";

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host === "admin.platillo.mx") {
    return {
      title: "Admin - Platillo",
      description: "Panel interno de administración de Platillo",
    };
  }

  return {
    title: "Platillo | Pedidos sin comisiones",
    description: "Sistema de pedidos para restaurantes sin comisiones por pedido.",
  };
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host === "admin.platillo.mx") {
    const session = await requireSuperAdmin();

    if (session?.denied) {
      return (
        <div className="min-h-screen flex items-center justify-center">
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

    return (
      <div className="min-h-screen p-10">
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-[var(--gray-color)] mt-1">
          Bienvenido, {session?.uid}
        </p>
      </div>
    );
  }

  return <LandingClient />;
}