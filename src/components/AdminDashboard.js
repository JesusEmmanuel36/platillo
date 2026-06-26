import { getAdminMetrics } from "@/lib/admin-metrics";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

function MetricCard({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-1 p-5 rounded-xl border border-[var(--half-gray)] bg-[var(--background)]">
      <p className="text-xs text-[var(--gray-color)] uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-2xl font-bold ${highlight || "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const m = await getAdminMetrics();

  const mes = new Date().toLocaleString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="border-b border-[var(--half-gray)] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">Platillo Admin</p>
          <p className="text-xs text-[var(--gray-color)]">Panel interno</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/restaurants"
            className="text-sm px-4 py-2 rounded-lg border border-[var(--half-gray)] text-[var(--foreground)] hover:border-[var(--accent-color)] transition-colors"
          >
            Ver restaurantes
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Restaurantes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-color)] mb-3">Restaurantes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard label="Total" value={m.restaurantesTotales} />
            <MetricCard label="Activos" value={m.restaurantesActivos} highlight="text-[var(--green-text-color)]" />
            <MetricCard label="Suspendidos" value={m.restaurantesSuspendidos} highlight={m.restaurantesSuspendidos > 0 ? "text-[var(--red-text-color)]" : "text-[var(--foreground)]"} />
            <MetricCard label="En prueba" value={m.restaurantesEnPrueba} />
          </div>
        </div>

        {/* Billing */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-color)] mb-3">Facturación</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard label="Pagando" value={m.clientesPagando} highlight="text-[var(--green-text-color)]" />
            <MetricCard label="Vencidos" value={m.clientesVencidos} highlight={m.clientesVencidos > 0 ? "text-[var(--red-text-color)]" : "text-[var(--foreground)]"} />
            <MetricCard label="Ingreso mensual est." value={`$${m.ingresoMensualEstimado} MXN`} highlight="text-[var(--accent-color)]" />
          </div>
        </div>

        {/* Ventas del mes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-color)] mb-3">
            Ventas — {mes}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Pedidos online" value={m.pedidosEsteMes} />
            <MetricCard label="Ventas online" value={`$${m.ventasPedidosEsteMes}`} />
            <MetricCard label="Ventas manuales" value={`$${m.ventasManualesEsteMes}`} />
            <MetricCard label="Total generado" value={`$${m.ventasTotalesEsteMes}`} highlight="text-[var(--accent-color)]" />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gray-color)] mb-3">WhatsApp</p>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Mensajes enviados (mes)" value={m.mensajesEnviados} highlight="text-[var(--green-text-color)]" />
            <MetricCard label="Mensajes fallidos (mes)" value={m.mensajesFallidos} highlight={m.mensajesFallidos > 0 ? "text-[var(--red-text-color)]" : "text-[var(--foreground)]"} />
          </div>
        </div>

        {/* Links rápidos */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/restaurants"
            className="px-5 py-2 bg-[var(--accent-color)] text-white text-sm font-semibold rounded-lg"
          >
            Ver restaurantes →
          </Link>
        </div>
      </div>
    </div>
  );
}