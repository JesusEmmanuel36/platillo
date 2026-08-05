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

  const restaurantImage =
    session.restaurant?.imageUrl ||
    session.restaurant?.logoUrl ||
    session.restaurant?.image ||
    session.restaurant?.logo ||
    session.restaurant?.pfp ||
    null;

  const slug = session.restaurant?.slug || null;

  return (
    <PanelShell
      restaurantName={restaurantName}
      restaurantImage={restaurantImage}
      slug={slug}
    >
      {children}
    </PanelShell>
  );
}