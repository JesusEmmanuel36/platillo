import SettingsPanel from "@/components/panel/settings/SettingsPanel";
import { requireRestaurant } from "@/lib/panel-auth";

export const metadata = {
  title: {
    absolute: "Configuración - Platillo",
  },
  description:
    "Administra la apariencia, horarios, pagos, entregas y conexiones de tu restaurante.",
};

export default async function SettingsPage() {
  const session = await requireRestaurant();

  const restaurantName =
    session.restaurant?.name ||
    session.restaurant?.nombre ||
    "Mi restaurante";

  return (
    <SettingsPanel
      restaurantId={session.restaurantId}
      restaurantName={restaurantName}
    />
  );
}