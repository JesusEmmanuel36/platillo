import { getRestaurant } from "@/lib/firestore";
import CheckoutClient from "@/components/CheckoutClient";
import { redirect } from "next/navigation";
import { serializeFirestoreData } from "@/lib/serialize-firestore";

export default async function Page({ params }) {
  const { slug } = await params;

  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    redirect("https://platillo.mx");
  }

  const isSuspended = restaurant.platformStatus === "suspended";

  if (isSuspended) {
    redirect("https://platillo.mx");
  }

  return (
    <CheckoutClient
      restaurant={serializeFirestoreData(restaurant)}
    />
  );
}