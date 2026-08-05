import PanelShell from "@/components/panel/PanelShell";
import { requireRestaurant } from "@/lib/panel-auth";

export default async function RestaurantPanelLayout({
  children,
}) {
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
      {children}
    </PanelShell>
  );
}