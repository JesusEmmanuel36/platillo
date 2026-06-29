import { getRestaurant, getProducts } from "@/lib/firestore";
import RestaurantPage from "@/components/RestaurantPage";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { serializeFirestoreData } from "@/lib/serialize-firestore";

export default async function Page({ params }) {
  const { slug } = await params;

  const restaurant = await getRestaurant(slug);
  if (!restaurant) {
    return redirect("https://platillo.mx");
  }

  const isSuspended = restaurant.platformStatus === "suspended";

  if (isSuspended) {
    return redirect("https://platillo.mx");
  }

  const products = await getProducts(restaurant.id);

  return (
    <RestaurantPage
      restaurant={serializeFirestoreData(restaurant)}
      products={serializeFirestoreData(products)}
    />
  );
}
