import PanelPagePlaceholder from "@/components/panel/PanelPagePlaceholder";

export const metadata = {
  title: {
    absolute: "Configuración - Platillo",
  },
};

export default function SettingsPage() {
  return (
    <PanelPagePlaceholder
      eyebrow="Preferencias"
      title="Configuración"
      description="Administra la información del restaurante, horarios, entregas y conexiones."
    />
  );
}