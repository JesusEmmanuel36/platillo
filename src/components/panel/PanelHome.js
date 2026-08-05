import Link from "next/link";

const SECTIONS = [
  {
    href: "/pedidos",
    eyebrow: "Operación",
    title: "Pedidos",
    description:
      "Consulta y administra los pedidos de tu restaurante en tiempo real.",
  },
  {
    href: "/productos",
    eyebrow: "Catálogo",
    title: "Productos",
    description:
      "Administra productos, precios, categorías y disponibilidad.",
  },
  {
    href: "/analiticas",
    eyebrow: "Resultados",
    title: "Analíticas",
    description:
      "Revisa ventas, pedidos y comportamiento de tu restaurante.",
  },
  {
    href: "/configuracion",
    eyebrow: "Preferencias",
    title: "Configuración",
    description:
      "Modifica horarios, entregas, información y conexiones.",
  },
];

export default function PanelHome({ restaurantName }) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[var(--foreground)] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:p-8">
        <div className="absolute right-[-100px] top-[-120px] h-80 w-80 rounded-full bg-[var(--accent-color)] opacity-40 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[20%] h-72 w-72 rounded-full bg-[var(--light-accent)] opacity-20 blur-3xl" />

        <div className="relative">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
            Panel de restaurante
          </p>

          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Bienvenido a {restaurantName || "tu restaurante"}.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Administra pedidos, productos, analíticas y configuración desde un
            solo lugar.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
            Accesos rápidos
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            Administra tu negocio
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent-color)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                {section.eyebrow}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">
                  {section.title}
                </h3>

                <span className="text-xl text-[var(--accent-color)] transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[var(--gray-color)]">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}