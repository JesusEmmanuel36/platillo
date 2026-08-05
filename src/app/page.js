import { headers } from "next/headers";
import LandingClient from "./LandingClient";
import AdminDashboard from "@/components/AdminDashboard";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import { requireRestaurant } from "@/lib/panel-auth";

function getHostname(host) {
  return host.split(":")[0].toLowerCase();
}

function isAdminHost(host) {
  return getHostname(host) === "admin.platillo.mx";
}

function isPanelHost(host) {
  const hostname = getHostname(host);

  return (
    hostname === "panel.platillo.mx" ||
    (
      process.env.NODE_ENV !== "production" &&
      (
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      )
    )
  );
}

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (isAdminHost(host)) {
    return {
      title: {
        absolute: "Admin - Platillo",
      },
      description:
        "Panel interno de administración de Platillo",
    };
  }

  if (isPanelHost(host)) {
    return {
      title: {
        absolute: "Panel - Platillo",
      },
      description:
        "Panel de administración para restaurantes",
    };
  }

  return {
    title: {
      absolute: "Platillo - Pedidos sin comisiones",
    },
    description:
      "Sistema de pedidos para restaurantes sin comisiones por pedido.",
  };
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // ─── Administrador interno de Platillo ───────────────────────────────────
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

  // ─── Panel de restaurantes ───────────────────────────────────────────────
  if (isPanelHost(host)) {
    const session = await requireRestaurant();

    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Panel de Platillo
          </h1>

          <p className="mt-2 text-[var(--gray-color)]">
            Sesión iniciada correctamente.
          </p>

          <p className="mt-1 text-sm text-[var(--gray-color)]">
            Restaurante:{" "}
            {session.restaurant?.name ||
              session.restaurant?.nombre ||
              session.restaurantId}
          </p>
        </div>
      </main>
    );
  }

  // ─── Landing pública ─────────────────────────────────────────────────────
  return <LandingClient />;
}