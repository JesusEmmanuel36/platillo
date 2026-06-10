import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getRestaurant, getProducts } from "@/lib/firestore";
import RestaurantPage from "@/components/RestaurantPage";

export default async function Page({ params }) {
  const { slug } = params;

  // 👇 detectar dominio
  const headersList = headers();
  const host = headersList.get("host");

  // 👇 permitir SOLO pide.platillo.mx
  if (host !== "pide.platillo.mx") {
    return notFound();
  }

  const restaurant = await getRestaurant(slug);
  if (!restaurant) return <div>No encontrado</div>;

  const products = await getProducts(restaurant.id);

  return <RestaurantPage restaurant={restaurant} products={products} />;
}