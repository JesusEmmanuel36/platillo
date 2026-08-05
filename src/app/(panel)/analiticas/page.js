import PanelPagePlaceholder from "@/components/panel/PanelPagePlaceholder";

export const metadata = {
  title: {
    absolute: "Analíticas - Platillo",
  },
};

export default function AnalyticsPage() {
  return (
    <PanelPagePlaceholder
      eyebrow="Resultados"
      title="Analíticas"
      description="Consulta ventas, pedidos, productos populares y el rendimiento de tu restaurante."
    />
  );
}