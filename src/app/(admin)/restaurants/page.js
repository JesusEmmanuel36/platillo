import { getAdminRestaurants } from "@/lib/admin-restaurants";
import { requireSuperAdmin } from "@/lib/require-super-admin";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: {
    absolute: "Restaurantes - Platillo",
  },
  description: "Lista interna de restaurantes en Platillo",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getBillingLabel(status) {
  const labels = {
    trial: "Prueba",
    paid: "Pagando",
    overdue: "Vencido",
    cancelled: "Cancelado",
    free: "Gratis",
    unassigned: "Sin asignar",
  };

  return labels[status] || status || "—";
}

function getPlatformLabel(status) {
  const labels = {
    active: "Activo",
    suspended: "Suspendido",
  };

  return labels[status] || status || "—";
}

function getWhatsappLabel(status) {
  const labels = {
    connected: "Conectado",
    disconnected: "Desconectado",
    connecting: "Conectando",
    qr: "Esperando QR",
    ready: "Listo",
    error: "Error",
    expired: "Expirado",
    pending: "Pendiente",
  };

  return labels[status] || status || "—";
}

function getWhatsappTone(status) {
  if (status === "connected" || status === "ready") return "green";
  if (status === "error" || status === "expired") return "red";
  if (status === "connecting" || status === "qr" || status === "pending") {
    return "accent";
  }

  return "neutral";
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

function getPlatformTone(status) {
  if (status === "active") return "green";
  if (status === "suspended") return "red";
  return "neutral";
}

function getBillingTone(status) {
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

export default async function RestaurantsPage() {
  const session = await protectAdminPage();

  if (session?.denied) {
    return <AccessDenied />;
  }

  const { restaurants, summary } = await getAdminRestaurants();

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
              href="/"
              className="hidden rounded-full border border-[var(--half-gray)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] sm:inline-flex"
            >
              Dashboard
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--half-gray)] bg-[var(--foreground)] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:p-8">
          <div className="absolute right-[-80px] top-[-120px] h-80 w-80 rounded-full bg-[var(--accent-color)] opacity-40 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[25%] h-72 w-72 rounded-full bg-[var(--light-accent)] opacity-20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                Clientes
              </p>

              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                Restaurantes en Platillo.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Revisa clientes, estados, ventas mensuales y conexión de
                WhatsApp usando el ID real del documento en Firestore.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-white/65">
                Ingreso mensual estimado
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight">
                {formatCurrency(summary.monthlyRevenue)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total"
            value={summary.total}
            description="Restaurantes registrados"
          />
          <MetricCard
            label="Activos"
            value={summary.active}
            description="Pueden operar"
            tone="green"
          />
          <MetricCard
            label="Suspendidos"
            value={summary.suspended}
            description="Bloqueados"
            tone={summary.suspended > 0 ? "red" : "neutral"}
          />
          <MetricCard
            label="Ventas del mes"
            value={formatCurrency(summary.totalSales)}
            description="Online + manuales"
            tone="accent"
          />
        </section>

        <section className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-3 border-b border-[var(--half-gray)] p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                Directorio
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight">
                Lista de restaurantes
              </h2>
              <p className="mt-1 text-sm text-[var(--gray-color)]">
                {restaurants.length} restaurante
                {restaurants.length === 1 ? "" : "s"} encontrado
                {restaurants.length === 1 ? "" : "s"}.
              </p>
            </div>

            <div className="rounded-full bg-[var(--light-gray)] px-4 py-2 text-sm font-bold text-[var(--gray-color)]">
              ID real de Firestore
            </div>
          </div>

          {restaurants.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-black">Todavía no hay restaurantes</p>
              <p className="mt-1 text-sm text-[var(--gray-color)]">
                Cuando registres restaurantes aparecerán aquí.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--half-gray)] text-[11px] uppercase tracking-[0.16em] text-[var(--gray-color)]">
                      <th className="px-5 py-4 font-black">Restaurante</th>
                      <th className="px-5 py-4 font-black">Estados</th>
                      <th className="px-5 py-4 font-black">Pago</th>
                      <th className="px-5 py-4 font-black">Ventas mes</th>
                      <th className="px-5 py-4 font-black">WhatsApp</th>
                      <th className="px-5 py-4 font-black text-right">
                        Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr
                        key={restaurant.id}
                        className="border-b border-[var(--half-gray)] last:border-b-0"
                      >
                        <td className="px-5 py-5 align-top">
                          <div className="flex items-center gap-3">
                            {restaurant.pfp ? (
                              <img
                                src={restaurant.pfp}
                                alt={restaurant.name}
                                className="h-12 w-12 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--light-accent)] text-lg font-black text-[var(--accent-color)]">
                                {restaurant.name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-black">{restaurant.name}</p>
                              <p className="text-sm text-[var(--gray-color)]">
                                /{restaurant.slug}
                              </p>
                              <p className="mt-1 max-w-[260px] truncate font-mono text-xs text-[var(--gray-color)]">
                                {restaurant.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <Pill
                              tone={getPlatformTone(restaurant.platformStatus)}
                            >
                              {getPlatformLabel(restaurant.platformStatus)}
                            </Pill>
                            <span className="text-sm text-[var(--gray-color)]">
                              {restaurant.phone || "Sin teléfono"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <Pill
                              tone={getBillingTone(restaurant.billing.status)}
                            >
                              {getBillingLabel(restaurant.billing.status)}
                            </Pill>
                            <span className="text-sm text-[var(--gray-color)]">
                              {formatCurrency(restaurant.billing.monthlyPrice)}
                            </span>
                            <span className="text-xs text-[var(--gray-color)]">
                              Trial:{" "}
                              {formatDate(restaurant.billing.trialEndsAt)}
                            </span>
                            <span className="text-xs text-[var(--gray-color)]">
                              Pagado: {formatDate(restaurant.billing.paidUntil)}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-1">
                            <p className="font-black text-[var(--accent-color)]">
                              {formatCurrency(
                                restaurant.metrics.ventasTotalesEsteMes,
                              )}
                            </p>
                            <p className="text-xs text-[var(--gray-color)]">
                              {restaurant.metrics.pedidosEsteMes} pedidos
                            </p>
                            <p className="text-xs text-[var(--gray-color)]">
                              Online:{" "}
                              {formatCurrency(
                                restaurant.metrics.ventasOnlineEsteMes,
                              )}
                            </p>
                            <p className="text-xs text-[var(--gray-color)]">
                              Manual:{" "}
                              {formatCurrency(
                                restaurant.metrics.ventasManualesEsteMes,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5 align-top">
                          <div className="flex flex-col gap-2">
                            <Pill
                              tone={getWhatsappTone(
                                restaurant.whatsappBot.status,
                              )}
                            >
                              {getWhatsappLabel(restaurant.whatsappBot.status)}
                            </Pill>
                            <span className="text-xs text-[var(--gray-color)]">
                              {restaurant.whatsappStats.sentThisMonth} enviados
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-right align-top">
                          <Link
                            href={`/restaurants/${restaurant.id}`}
                            className="inline-flex rounded-full bg-[var(--accent-color)] px-4 py-2 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(237,64,11,0.24)]"
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 lg:hidden">
                {restaurants.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    className="rounded-3xl border border-[var(--half-gray)] p-4 transition-all hover:border-[var(--accent-color)]"
                  >
                    <div className="flex items-start gap-3">
                      {restaurant.pfp ? (
                        <img
                          src={restaurant.pfp}
                          alt={restaurant.name}
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--light-accent)] text-lg font-black text-[var(--accent-color)]">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black">{restaurant.name}</p>
                            <p className="text-sm text-[var(--gray-color)]">
                              /{restaurant.slug}
                            </p>
                          </div>

                          <Pill
                            tone={getBillingTone(restaurant.billing.status)}
                          >
                            {getBillingLabel(restaurant.billing.status)}
                          </Pill>
                        </div>

                        <p className="mt-3 truncate font-mono text-xs text-[var(--gray-color)]">
                          {restaurant.id}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-[var(--light-gray)] p-3">
                            <p className="text-xs text-[var(--gray-color)]">
                              Ventas mes
                            </p>
                            <p className="font-black text-[var(--accent-color)]">
                              {formatCurrency(
                                restaurant.metrics.ventasTotalesEsteMes,
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[var(--light-gray)] p-3">
                            <p className="text-xs text-[var(--gray-color)]">
                              Pedidos
                            </p>
                            <p className="font-black">
                              {restaurant.metrics.pedidosEsteMes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
