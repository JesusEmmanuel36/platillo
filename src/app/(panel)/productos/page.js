import PanelPagePlaceholder from "@/components/panel/PanelPagePlaceholder";

export const metadata = {
  title: {
    absolute: "Productos - Platillo",
  },
};

export default function ProductsPage() {
  return (
    <PanelPagePlaceholder
      eyebrow="Catálogo"
      title="Productos"
      description="Administra productos, categorías, precios, imágenes y disponibilidad."
    />
  );
}