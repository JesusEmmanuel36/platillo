import { headers } from "next/headers";
import AdminLogin from "@/components/auth/AdminLogin";
import RestaurantLogin from "@/components/auth/RestaurantLogin";

function getHostname(host) {
  return host.split(":")[0].toLowerCase();
}

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = getHostname(host);

  if (hostname === "admin.platillo.mx") {
    return {
      title: {
        absolute: "Admin - Platillo",
      },
      description: "Panel interno de administración de Platillo",
    };
  }

  return {
    title: {
      absolute: "Iniciar sesión - Platillo",
    },
    description: "Accede al panel de tu restaurante",
  };
}

export default async function LoginPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const hostname = getHostname(host);

  if (hostname === "admin.platillo.mx") {
    return <AdminLogin />;
  }

  return <RestaurantLogin />;
}