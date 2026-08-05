import { headers } from "next/headers";
import LandingClient from "./LandingClient";
import AdminDashboard from "@/components/AdminDashboard";
import PanelShell from "@/components/panel/PanelShell";
import PanelHome from "@/components/panel/PanelHome";
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

  if (isAdminHost(host)) {
    const session = await requireSuperAdmin();

    if (session?.denied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--red-text-color)]">
              Acceso denegado
            </p>

            <p className="mt-1 text-sm text-[var(--gray-color)]">
              Tu cuenta no tiene permisos de superadmin.
            </p>
          </div>
        </div>
      );
    }

    return <AdminDashboard />;
  }

  if (isPanelHost(host)) {
    const session = await requireRestaurant();

    const restaurantName =
      session.restaurant?.name ||
      session.restaurant?.nombre ||
      "Mi restaurante";

    const slug = session.restaurant?.slug || null;

    return (
      <PanelShell
        restaurantName={restaurantName}
        slug={slug}
      >
        <PanelHome restaurantName={restaurantName} />
      </PanelShell>
    );
  }

  return <LandingClient />;
}