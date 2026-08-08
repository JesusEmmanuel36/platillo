import OrdersPanel from "@/components/panel/orders/OrdersPanel";
import { requireRestaurant } from "@/lib/panel-auth";

export const metadata = {
  title: {
    absolute: "Pedidos - Platillo",
  },
  description:
    "Administra los pedidos de tu restaurante en tiempo real.",
};

export default async function OrdersPage() {
  const session = await requireRestaurant();

  return (
    <OrdersPanel
      restaurantId={session.restaurantId}
    />
  );
}