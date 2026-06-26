"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ACTIONS = [
  {
    action: "trial",
    label: "Poner en prueba",
    description: "Activa 14 días de prueba.",
    tone: "neutral",
  },
  {
    action: "paid",
    label: "Marcar pagado",
    description: "Activa 1 mes pagado.",
    tone: "green",
  },
  {
    action: "overdue",
    label: "Marcar vencido",
    description: "Cambia billing a overdue.",
    tone: "red",
  },
  {
    action: "suspend",
    label: "Suspender",
    description: "Bloquea operación.",
    tone: "red",
  },
  {
    action: "activate",
    label: "Activar",
    description: "Permite operar.",
    tone: "green",
  },
  {
    action: "free",
    label: "Marcar gratis",
    description: "Plan gratis manual.",
    tone: "accent",
  },
];

function buttonClasses(tone, loading) {
  const base =
    "group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";

  const tones = {
    neutral:
      "border-[var(--half-gray)] bg-[var(--background)] hover:border-[var(--accent-color)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]",
    green:
      "border-[var(--green-text-color)] bg-[var(--green-color)] text-[var(--green-text-color)] hover:shadow-[0_18px_45px_rgba(46,125,50,0.14)]",
    red:
      "border-[var(--red-text-color)] bg-[var(--red-color)] text-[var(--red-text-color)] hover:shadow-[0_18px_45px_rgba(210,22,22,0.14)]",
    accent:
      "border-[var(--accent-color)] bg-[var(--accent-color)] text-white hover:shadow-[0_18px_45px_rgba(237,64,11,0.22)]",
  };

  return `${base} ${tones[tone] || tones.neutral} ${loading ? "opacity-60" : ""}`;
}

export default function AdminRestaurantActions({ restaurantId }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState("");

  async function runAction(action) {
    setError("");

    const confirmMessage = {
      trial: "¿Poner este restaurante en prueba por 14 días?",
      paid: "¿Marcar este restaurante como pagado por 1 mes?",
      overdue: "¿Marcar este restaurante como vencido?",
      suspend: "¿Suspender este restaurante?",
      activate: "¿Activar este restaurante?",
      free: "¿Marcar este restaurante como gratis?",
    }[action];

    if (!window.confirm(confirmMessage || "¿Confirmar acción?")) return;

    setLoadingAction(action);

    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.reason || "Error al ejecutar acción");
      }

      router.refresh();
    } catch (e) {
      setError(e.message || "Error al ejecutar acción");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] p-5">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
          Acciones manuales
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight">
          Control del restaurante
        </h2>
        <p className="mt-1 text-sm text-[var(--gray-color)]">
          Cambios directos sobre el documento del restaurante.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-[var(--red-text-color)] bg-[var(--red-color)] px-4 py-3 text-sm font-semibold text-[var(--red-text-color)]">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((item) => {
          const loading = loadingAction === item.action;

          return (
            <button
              key={item.action}
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={() => runAction(item.action)}
              className={buttonClasses(item.tone, loading)}
            >
              <p className="font-black">
                {loading ? "Aplicando..." : item.label}
              </p>
              <p
                className={`mt-1 text-xs ${
                  item.tone === "accent"
                    ? "text-white/75"
                    : item.tone === "green" || item.tone === "red"
                      ? "opacity-80"
                      : "text-[var(--gray-color)]"
                }`}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}