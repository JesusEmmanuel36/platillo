import { getRestaurant } from "@/lib/firestore";
import { redirect } from "next/navigation";
import PedidosPage from "@/components/PedidosPage";
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
    <PedidosPage
      restaurant={serializeFirestoreData(restaurant)}
      slug={slug}
    />
  );
}