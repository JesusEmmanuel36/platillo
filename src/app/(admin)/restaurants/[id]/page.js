import { getAdminRestaurantDetail } from "@/lib/admin-restaurants";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import AdminRestaurantActions from "@/components/AdminRestaurantActions";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: {
    absolute: "Detalle de restaurante - Platillo",
  },
  description: "Detalle interno de restaurante en Platillo",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date, withTime = false) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function StatusBadge({ children, tone = "neutral" }) {
  const tones = {
    green: "bg-[var(--green-color)] text-[var(--green-text-color)]",
    red: "bg-[var(--red-color)] text-[var(--red-text-color)]",
    accent: "bg-[var(--light-accent)] text-[var(--accent-color)]",
    neutral: "bg-[var(--light-gray)] text-[var(--gray-color)]",
  };

  return (
    <div
      className={`flex flex-row items-center justify-center rounded-[10px] px-3 py-1 text-[14px]  font-semibold ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

function getPlatformLabel(status) {
  const labels = {
    active: "Activo",
    suspended: "Suspendido",
  };

  return labels[status] || status || "—";
}

function getBillingLabel(status) {
  const labels = {
    unassigned: "Sin asignar",
    trial: "Prueba",
    paid: "Pagando",
    overdue: "Vencido",
    cancelled: "Cancelado",
    free: "Gratis",
  };

  return labels[status] || "-";
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-[var(--half-gray)] bg-[var(--light-gray)] text-[var(--foreground)]",
    green:
      "border-[var(--green-text-color)] bg-[var(--green-color)] text-[var(--green-text-color)]",
    red: "border-[var(--red-text-color)] bg-[var(--red-color)] text-[var(--red-text-color)]",
    accent:
      "border-[var(--accent-color)] bg-[var(--light-accent)] text-[var(--accent-color)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  );
}

function MetricCard({ label, value, description, tone = "neutral" }) {
  const tones = {
    neutral: "text-[var(--foreground)]",
    green: "text-[var(--green-text-color)]",
    red: "text-[var(--red-text-color)]",
    accent: "text-[var(--accent-color)]",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[var(--light-accent)] opacity-25" />

      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gray-color)]">
          {label}
        </p>
        <p className={`mt-2 text-3xl font-black tracking-tight ${tones[tone]}`}>
          {value}
        </p>
        {description && (
          <p className="mt-1 text-sm text-[var(--gray-color)]">{description}</p>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--gray-color)]">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-sm font-bold ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function getPlatformTone(status) {
  if (status === "active") return "green";
  if (status === "suspended") return "red";
  return "neutral";
}

function getBillingTone(status) {
  if (!status || status === "unassigned") return "neutral";
  if (status === "paid" || status === "free") return "green";
  if (status === "overdue" || status === "cancelled") return "red";
  if (status === "trial") return "accent";
  return "neutral";
}

async function protectAdminPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  const isAdminHost =
    host === "admin.platillo.mx" || host.startsWith("localhost:");

  if (!isAdminHost) {
    redirect("https://platillo.mx");
  }

  const session = await requireSuperAdmin();
  return session;
}

function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
      <div className="max-w-md rounded-[2rem] border border-[var(--half-gray)] p-8 text-center">
        <p className="text-xl font-black text-[var(--red-text-color)]">
          Acceso denegado
        </p>
        <p className="mt-2 text-sm text-[var(--gray-color)]">
          Tu cuenta no tiene permisos de superadmin.
        </p>
      </div>
    </main>
  );
}

export default async function RestaurantDetailPage({ params }) {
  const session = await protectAdminPage();

  if (session?.denied) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const data = await getAdminRestaurantDetail(id);

  if (!data) {
    notFound();
  }

  const { restaurant, metrics, recentOrders, recentManualSales } = data;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-120px] h-96 w-96 rounded-full bg-[var(--light-accent)] opacity-30 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-96 w-96 rounded-full bg-[var(--light-gray)] opacity-80 blur-3xl" />
      </div>

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
        <Link
          href="/restaurants"
          className="w-fit rounded-full border border-[var(--half-gray)] px-4 py-2 text-sm font-bold text-[var(--gray-color)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
        >
          ← Volver a restaurantes
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] bg-[var(--foreground)] text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
          <div className="relative overflow-hidden p-6 sm:p-8">
            {/* Sombra naranja / glow de fondo */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-color)] opacity-30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--light-accent)] opacity-20 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                {restaurant.pfp ? (
                  <img
                    src={restaurant.pfp}
                    alt={restaurant.name}
                    className="h-20 w-20 rounded-3xl border border-white/15 object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent-color)] text-3xl font-black text-white shadow-xl">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Pill tone={getPlatformTone(restaurant.platformStatus)}>
                      {getPlatformLabel(restaurant.platformStatus)}
                    </Pill>

                    <Pill tone={getBillingTone(restaurant.billing.status)}>
                      {getBillingLabel(restaurant.billing.status)}
                    </Pill>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    {restaurant.name}
                  </h1>

                  <p className="mt-2 text-sm text-white/70 sm:text-base">
                    pide.platillo.mx/{restaurant.slug}
                  </p>

                  <p className="mt-3 max-w-2xl break-all font-mono text-xs text-white/50">
                    {restaurant.id}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white/65">
                  Total generado este mes
                </p>
                <p className="mt-2 text-4xl font-black tracking-tight">
                  {formatCurrency(metrics.ventasTotalesEsteMes)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Pedidos este mes"
            value={metrics.pedidosEsteMes}
            description="Pedidos online"
          />
          <MetricCard
            label="Ventas online"
            value={formatCurrency(metrics.ventasOnlineEsteMes)}
            description="Desde orders"
          />
          <MetricCard
            label="Ventas manuales"
            value={formatCurrency(metrics.ventasManualesEsteMes)}
            description="Desde manual_sales"
          />
          <MetricCard
            label="Total generado"
            value={formatCurrency(metrics.ventasTotalesEsteMes)}
            description="Online + manuales"
            tone="accent"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] p-5">
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                Información
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Datos del restaurante
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Nombre" value={restaurant.name} />
              <InfoItem label="Slug" value={`/${restaurant.slug}`} />
              <InfoItem label="ID documento" value={restaurant.id} mono />
              <InfoItem label="UID dueño" value={restaurant.uid} mono />
              <InfoItem label="Teléfono" value={restaurant.phone} />
              <InfoItem label="Dirección" value={restaurant.address} />
              <InfoItem
                label="Abierto ahora"
                value={restaurant.isOpen ? "Sí" : "No"}
              />
              <InfoItem
                label="Siempre abierto"
                value={restaurant.alwaysOpen ? "Sí" : "No"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] p-5">
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                  Cobranza
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight">
                  Billing
                </h2>
              </div>

              <div className="grid gap-3">
                <InfoItem
                  label="Estado"
                  value={getBillingLabel(restaurant.billing.status)}
                />
                <InfoItem
                  label="Precio mensual"
                  value={formatCurrency(restaurant.billing.monthlyPrice)}
                />
                <InfoItem
                  label="Inicio de prueba"
                  value={formatDate(restaurant.billing.trialStartedAt)}
                />
                <InfoItem
                  label="Fin de prueba"
                  value={formatDate(restaurant.billing.trialEndsAt)}
                />
                <InfoItem
                  label="Pagado hasta"
                  value={formatDate(restaurant.billing.paidUntil)}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] p-5">
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                  WhatsApp
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight">
                  Bot y mensajes
                </h2>
              </div>

              <div className="grid gap-3">
                <InfoItem
                  label="Bot enabled"
                  value={restaurant.whatsappBot.enabled ? "Sí" : "No"}
                />
                <InfoItem
                  label="Status"
                  value={restaurant.whatsappBot.status}
                />
                <InfoItem
                  label="Teléfono vinculado"
                  value={restaurant.whatsappBot.linkedPhone}
                />
                <InfoItem
                  label="Error"
                  value={restaurant.whatsappBot.error || "Sin error"}
                />
                <InfoItem
                  label="Enviados este mes"
                  value={restaurant.whatsappStats.sentThisMonth}
                />
                <InfoItem
                  label="Fallidos este mes"
                  value={restaurant.whatsappStats.failedThisMonth}
                />
                <InfoItem
                  label="Último mensaje"
                  value={formatDate(restaurant.whatsappStats.lastSentAt, true)}
                />
              </div>
            </div>
          </div>
        </section>

        <AdminRestaurantActions restaurantId={restaurant.id} />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="border-b border-[var(--half-gray)] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                Pedidos
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Pedidos recientes
              </h2>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--gray-color)]">
                No hay pedidos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[var(--half-gray)] text-[11px] uppercase tracking-[0.16em] text-[var(--gray-color)]">
                      <th className="px-5 py-4 font-black">Fecha</th>
                      <th className="px-5 py-4 font-black">Cliente</th>
                      <th className="px-5 py-4 font-black">Total</th>
                      <th className="px-5 py-4 font-black">Estado</th>
                      <th className="px-5 py-4 font-black">Pago</th>
                      <th className="px-5 py-4 font-black">Entrega</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[var(--half-gray)] last:border-b-0"
                      >
                        <td className="px-5 py-4 text-sm">
                          {formatDate(order.creadoEn, true)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold">{order.clienteNombre}</p>
                          <p className="text-xs text-[var(--gray-color)]">
                            {order.clienteTelefono || "Sin teléfono"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-black text-[var(--accent-color)]">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <Pill>{order.status}</Pill>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {order.metodoPago}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {order.tipoEntrega}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="border-b border-[var(--half-gray)] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                POS
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Ventas manuales
              </h2>
            </div>

            {recentManualSales.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--gray-color)]">
                No hay ventas manuales registradas.
              </div>
            ) : (
              <div className="divide-y divide-[var(--half-gray)]">
                {recentManualSales.map((sale) => (
                  <div key={sale.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black">{sale.metodo}</p>
                        <p className="mt-1 text-sm text-[var(--gray-color)]">
                          {sale.nota || "Sin nota"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--gray-color)]">
                          {formatDate(sale.creadoEn, true)}
                        </p>
                      </div>

                      <p className="font-black text-[var(--accent-color)]">
                        {formatCurrency(sale.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
