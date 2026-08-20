"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import PanelLogoutButton from "@/components/panel/PanelLogoutButton";

const NAVIGATION = [
  {
    href: "/pedidos",
    label: "Pedidos",
    icon: OrdersIcon,
  },
  {
    href: "/analiticas",
    label: "Analíticas",
    icon: AnalyticsIcon,
  },
  {
    href: "/productos",
    label: "Productos",
    icon: ProductsIcon,
  },
  {
    href: "/configuracion",
    label: "Configuración",
    icon: SettingsIcon,
  },
];

function OrdersIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function AnalyticsIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

function ProductsIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function SettingsIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.4 1.16V21a2 2 0 1 1-4 0v-.09A1.8 1.8 0 0 0 8.4 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1 1.8 1.8 0 0 0-1.16-.4H3a2 2 0 1 1 0-4h.09A1.8 1.8 0 0 0 4.6 8.4a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6 1.8 1.8 0 0 0 .4-1.16V3a2 2 0 1 1 4 0v.09A1.8 1.8 0 0 0 15.6 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c.17.38.38.72.6 1 .31.39.72.6 1.16.6H21a2 2 0 1 1 0 4h-.09A1.8 1.8 0 0 0 19.4 15Z" />
    </svg>
  );
}

function MenuIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="m10 14 11-11" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function SidebarContent({
  pathname,
  restaurantName,
  restaurantImage,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col">
  

      <nav className="flex-1 space-y-1.5 px-3 py-5">
        {NAVIGATION.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-[8px] px-3.5 py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-[var(--accent-color)] text-[var(--background)] "
                  : "text-[var(--foreground)] hover:bg-[var(--light-gray)]"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  active
                    ? "text-[var(--background)]"
                    : "text-[var(--foreground)] "
                }`}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--light-gray)] p-4">
        <p className="text-xs leading-5 text-[var(--gray-color)]">
          Administra tus pedidos, productos y configuración desde un solo lugar.
        </p>
      </div>
    </div>
  );
}

export default function PanelShell({
  children,
  restaurantName,
  restaurantImage,
  slug,
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuUrl = slug
    ? `https://pide.platillo.mx/${encodeURIComponent(slug)}`
    : null;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--light-background)] text-[var(--foreground)]">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--half-gray)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--half-gray)] text-[var(--foreground)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] lg:hidden"
              aria-label={
                mobileOpen ? "Cerrar menú lateral" : "Abrir menú lateral"
              }
            >
              {mobileOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>

            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Platillo"
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {menuUrl ? (
              <a
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--half-gray)] bg-[var(--background)] px-3 text-sm font-bold text-[var(--foreground)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] sm:px-4"
              >
                <ExternalLinkIcon className="h-4 w-4" />

                <span className="hidden sm:inline">Ver menú</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Este restaurante todavía no tiene un slug configurado"
                className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-[var(--half-gray)] bg-[var(--background)] px-3 text-sm font-bold text-[var(--gray-color)] opacity-60 sm:px-4"
              >
                <ExternalLinkIcon className="h-4 w-4" />

                <span className="hidden sm:inline">Ver menú</span>
              </button>
            )}

            <PanelLogoutButton />
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-72 border-r border-[var(--half-gray)] bg-[var(--background)] lg:block">
        <SidebarContent
          pathname={pathname}
          restaurantName={restaurantName}
          restaurantImage={restaurantImage}
        />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-black/35 lg:hidden"
            aria-label="Cerrar menú lateral"
          />

          <aside className="fixed bottom-0 left-0 top-16 z-40 w-[min(18rem,85vw)] border-r border-[var(--half-gray)] bg-[var(--background)] shadow-2xl lg:hidden">
            <SidebarContent
              pathname={pathname}
              restaurantName={restaurantName}
              restaurantImage={restaurantImage}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      <main className="min-h-screen pt-16 lg:pl-72">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
