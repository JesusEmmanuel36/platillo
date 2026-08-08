import ProductsPanel from "@/components/panel/products/ProductsPanel";
import { requireRestaurant } from "@/lib/panel-auth";

export const metadata = {
  title: {
    absolute: "Productos - Platillo",
  },
  description:
    "Administra productos, categorías, precios, imágenes y disponibilidad.",
};

export default async function ProductsPage() {
  const session = await requireRestaurant();

  return (
    <ProductsPanel
      restaurantId={session.restaurantId}
    />
  );
}