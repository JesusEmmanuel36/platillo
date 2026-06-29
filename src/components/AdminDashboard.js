import { getAdminMetrics } from "@/lib/admin-metrics";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function MetricCard({ label, value, description, tone = "neutral" }) {
  const toneStyles = {
    neutral: {
      dot: "bg-[var(--gray-color)]",
      value: "text-[var(--foreground)]",
      bg: "bg-[var(--background)]",
    },
    accent: {
      dot: "bg-[var(--accent-color)]",
      value: "text-[var(--accent-color)]",
      bg: "bg-[var(--background)]",
    },
    green: {
      dot: "bg-[var(--green-text-color)]",
      value: "text-[var(--green-text-color)]",
      bg: "bg-[var(--background)]",
    },
    red: {
      dot: "bg-[var(--red-text-color)]",
      value: "text-[var(--red-text-color)]",
      bg: "bg-[var(--background)]",
    },
  };

  const styles = toneStyles[tone] || toneStyles.neutral;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-[var(--half-gray)] ${styles.bg} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-[var(--light-accent)] opacity-25" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gray-color)]">
              {label}
            </p>
          </div>

          <div>
            <p className={`text-3xl font-black tracking-tight ${styles.value}`}>
              {value}
            </p>

            {description && (
              <p className="mt-1 text-sm text-[var(--gray-color)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
      </div>

      {action}
    </div>
  );
}

export default async function AdminDashboard() {
  const m = await getAdminMetrics();

  const mes = new Date().toLocaleString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const hayProblemas =
    (m.restaurantesSuspendidos || 0) > 0 ||
    (m.clientesVencidos || 0) > 0 ||
    (m.mensajesFallidos || 0) > 0;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Background decorativo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-120px] h-96 w-96 rounded-full bg-[var(--light-accent)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-96 w-96 rounded-full bg-[var(--light-gray)] opacity-80 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--half-gray)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Platillo"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/restaurants"
              className="hidden rounded-full border border-[var(--half-gray)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] sm:inline-flex"
            >
              Restaurantes
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--half-gray)] bg-[var(--foreground)] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:p-8">
          <div className="absolute right-[-80px] top-[-120px] h-80 w-80 rounded-full bg-[var(--accent-color)] opacity-40 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[25%] h-72 w-72 rounded-full bg-[var(--light-accent)] opacity-20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                Resumen general
              </p>

              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                Control de Platillo en tiempo real.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Métricas principales de restaurantes, facturación, ventas y
                WhatsApp para {mes}.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white/65">
                Ingreso mensual estimado
              </p>

              <p className="mt-2 text-4xl font-black tracking-tight">
                {formatCurrency(m.ingresoMensualEstimado)}
              </p>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="text-sm text-white/65">Clientes pagando</span>
                <span className="text-lg font-black">{m.clientesPagando}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Estado rápido */}
        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gray-color)]">
              Estado
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  hayProblemas
                    ? "bg-[var(--red-text-color)]"
                    : "bg-[var(--green-text-color)]"
                }`}
              />

              <p className="text-lg font-black">
                {hayProblemas ? "Revisar pendientes" : "Todo estable"}
              </p>
            </div>

            <p className="mt-1 text-sm text-[var(--gray-color)]">
              {hayProblemas
                ? "Hay vencidos, suspendidos o mensajes fallidos."
                : "No hay alertas importantes por ahora."}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gray-color)]">
              Ventas generadas
            </p>

            <p className="mt-3 text-3xl font-black text-[var(--accent-color)]">
              {formatCurrency(m.ventasTotalesEsteMes)}
            </p>

            <p className="mt-1 text-sm text-[var(--gray-color)]">
              Online + manuales durante {mes}.
            </p>
          </div>

          <Link
            href="/restaurants"
            className="group rounded-2xl border border-[var(--accent-color)] bg-[var(--accent-color)] p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(237,64,11,0.24)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              Acción rápida
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-xl font-black">Ver restaurantes</p>
              <span className="text-2xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>

            <p className="mt-1 text-sm text-white/75">
              Administrar clientes, pagos y estados.
            </p>
          </Link>
        </section>

        {/* Restaurantes */}
        <section>
          <SectionHeader eyebrow="Operación" title="Restaurantes" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total"
              value={m.restaurantesTotales}
              description="Restaurantes registrados"
            />

            <MetricCard
              label="Activos"
              value={m.restaurantesActivos}
              description="Pueden operar"
              tone="green"
            />

            <MetricCard
              label="Suspendidos"
              value={m.restaurantesSuspendidos}
              description="Sin acceso operativo"
              tone={m.restaurantesSuspendidos > 0 ? "red" : "neutral"}
            />

            <MetricCard
              label="En prueba"
              value={m.restaurantesEnPrueba}
              description="Periodo trial activo"
              tone="accent"
            />
          </div>
        </section>

        {/* Facturación y ventas */}
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeader eyebrow="Cobranza" title="Facturación" />

            <div className="grid gap-4">
              <MetricCard
                label="Pagando"
                value={m.clientesPagando}
                description="Clientes con status paid"
                tone="green"
              />

              <MetricCard
                label="Vencidos"
                value={m.clientesVencidos}
                description="Clientes con status overdue"
                tone={m.clientesVencidos > 0 ? "red" : "neutral"}
              />

              <MetricCard
                label="Ingreso mensual"
                value={formatCurrency(m.ingresoMensualEstimado)}
                description="Estimado por suscripciones"
                tone="accent"
              />
            </div>
          </div>

          <div>
            <SectionHeader eyebrow="Mes actual" title={`Ventas — ${mes}`} />

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                label="Pedidos online"
                value={m.pedidosEsteMes}
                description="Pedidos recibidos este mes"
              />

              <MetricCard
                label="Ventas online"
                value={formatCurrency(m.ventasPedidosEsteMes)}
                description="Total desde pedidos"
              />

              <MetricCard
                label="Ventas manuales"
                value={formatCurrency(m.ventasManualesEsteMes)}
                description="Registradas desde POS"
              />

              <MetricCard
                label="Total generado"
                value={formatCurrency(m.ventasTotalesEsteMes)}
                description="Online + manuales"
                tone="accent"
              />
            </div>
          </div>
        </section>

        {/* WhatsApp */}
        <section>
          <SectionHeader eyebrow="Mensajería" title="WhatsApp" />

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Mensajes enviados"
              value={m.mensajesEnviados}
              description="Contador mensual"
              tone="green"
            />

            <MetricCard
              label="Mensajes fallidos"
              value={m.mensajesFallidos}
              description="Errores detectados este mes"
              tone={m.mensajesFallidos > 0 ? "red" : "neutral"}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
