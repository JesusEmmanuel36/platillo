 
import { getRestaurant } from "@/lib/firestore";
import { redirect } from "next/navigation";
import PedidosPage from "@/components/PedidosPage";  

export default async function Page({ params }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return redirect("https://platillo.mx");

  return <PedidosPage restaurant={restaurant} slug={slug} />;
}