import { getRestaurant } from "@/lib/firestore";
import CheckoutClient from "@/components/CheckoutClient";

export default async function Page({ params }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) return <div>No encontrado</div>;

  return <CheckoutClient restaurant={restaurant} />;
}