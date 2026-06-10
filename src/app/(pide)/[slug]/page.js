import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getRestaurant, getProducts } from "@/lib/firestore";
import RestaurantPage from "@/components/RestaurantPage";

export default async function Page({ params }) {
  const { slug } = await params;

  const headersList = await headers();
  const host = headersList.get("host");

  const isPideDomain = host === "pide.platillo.mx";

  if (!isPideDomain) {
    return redirect("https://platillo.mx");
  }

  const restaurant = await getRestaurant(slug);
  if (!restaurant) return redirect("https://platillo.mx");

  const products = await getProducts(restaurant.id);

  return <RestaurantPage restaurant={restaurant} products={products} />;
}
