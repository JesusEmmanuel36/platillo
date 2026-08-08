import AnalyticsPanel from "@/components/panel/analytics/AnalyticsPanel";
import { requireRestaurant } from "@/lib/panel-auth";

export const metadata = {
  title: {
    absolute: "Analíticas - Platillo",
  },
  description:
    "Consulta ventas, pedidos, productos populares y el rendimiento de tu restaurante.",
};

export default async function AnalyticsPage() {
  const session = await requireRestaurant();

  const restaurantName =
    session.restaurant?.name ||
    session.restaurant?.nombre ||
    "Mi restaurante";

  return (
    <AnalyticsPanel
      restaurantId={session.restaurantId}
      restaurantName={restaurantName}
    />
  );
}