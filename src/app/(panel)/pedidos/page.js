import PanelPagePlaceholder from "@/components/panel/PanelPagePlaceholder";

export const metadata = {
  title: {
    absolute: "Pedidos - Platillo",
  },
};

export default function OrdersPage() {
  return (
    <PanelPagePlaceholder
      eyebrow="Operación"
      title="Pedidos"
      description="Consulta, acepta y administra los pedidos de tu restaurante en tiempo real."
    />
  );
}