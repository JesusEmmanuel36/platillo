"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";

const STATUS_CONFIG = {
  procesando: {
    label: "Procesando",
    classes: "bg-[var(--light-gray)] text-[var(--gray-color)]",
  },
  preparando: {
    label: "Preparando",
    classes: "bg-[var(--pendiente-color)] text-[var(--pendiente-text-color)]",
  },
  listo: {
    label: "Listo",
    classes: "bg-[var(--green-color)] text-[var(--green-text-color)]",
  },
  en_camino: {
    label: "Listo",
    classes: "bg-[var(--green-color)] text-[var(--green-text-color)]",
  },
  entregado: {
    label: "Entregado",
    classes: "bg-[var(--green-color)] text-[var(--green-text-color)]",
  },
  cancelado: {
    label: "Cancelado",
    classes: "bg-[var(--red-color)] text-[var(--red-text-color)]",
  },
};

const FILTERS = [
  {
    value: "todos",
    label: "Todos",
  },
  {
    value: "activos",
    label: "En curso",
  },
  {
    value: "listos",
    label: "Listos",
  },
  {
    value: "entregados",
    label: "Entregados",
  },
  {
    value: "cancelados",
    label: "Cancelados",
  },
];

const RAZONES_CANCELACION = [
  "Producto agotado",
  "Ingrediente no disponible",
  "Error en stock",
  "Producto descontinuado",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value) || 0);
}

function timestampToDate(timestamp) {
  if (!timestamp) return null;

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }

  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDay(firstDate, secondDate) {
  if (!firstDate || !secondDate) return false;

  return (
    firstDate.getDate() === secondDate.getDate() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getFullYear() === secondDate.getFullYear()
  );
}

function formatOrderDate(timestamp) {
  const date = timestampToDate(timestamp);

  if (!date) {
    return "Sin fecha";
  }

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const time = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay(date, today)) {
    return `Hoy · ${time}`;
  }

  if (sameDay(date, yesterday)) {
    return `Ayer · ${time}`;
  }

  const day = date.getDate();

  const month = date.toLocaleString("es-MX", {
    month: "short",
  });

  return `${day} ${month} · ${time}`;
}

function getOrderNumber(orderId) {
  if (!orderId) return "—";

  return orderId.slice(-6).toUpperCase();
}

function getItemCount(order) {
  return (order.items || []).reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0,
  );
}

function getOrderSummary(order) {
  const items = order.items || [];

  if (items.length === 0) {
    return "Sin productos";
  }

  return items
    .map((item) => {
      const quantity = Number(item.quantity) || 1;

      return `${quantity} ${item.name || "Producto"}`;
    })
    .join(", ");
}

function getOptionLines(options) {
  if (!options || typeof options !== "object") {
    return [];
  }

  return Object.entries(options)
    .map(([title, value]) => {
      if (value === null || value === undefined) {
        return null;
      }

      if (typeof value === "string") {
        return value.trim() ? `${title}: ${value}` : null;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return `${title}: ${String(value)}`;
      }

      if (Array.isArray(value)) {
        const choices = value
          .map((choice) => {
            if (typeof choice === "string") {
              return choice;
            }

            return choice?.name || "";
          })
          .filter(Boolean);

        return choices.length ? `${title}: ${choices.join(", ")}` : null;
      }

      if (typeof value === "object" && value.name) {
        return `${title}: ${value.name}`;
      }

      if (typeof value === "object") {
        const choices = Object.values(value)
          .map((choice) => {
            if (!choice) return "";

            const name =
              typeof choice === "string" ? choice : choice.name || "";

            const quantity = Number(choice.quantity) || 1;

            if (!name) return "";

            return quantity > 1 ? `${name} x${quantity}` : name;
          })
          .filter(Boolean);

        return choices.length ? `${title}: ${choices.join(", ")}` : null;
      }

      return null;
    })
    .filter(Boolean);
}

function getPaymentLabel(method) {
  const labels = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta: "Tarjeta",
  };

  return labels[method] || method || "No especificado";
}

function getFirebaseUser() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let unsubscribe = () => {};

    const timeout = setTimeout(() => {
      unsubscribe();

      reject(new Error("No se encontró una sesión de Firebase activa."));
    }, 5000);

    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timeout);
        unsubscribe();

        if (!user) {
          reject(new Error("No se encontró una sesión de Firebase activa."));

          return;
        }

        resolve(user);
      },
      (error) => {
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      },
    );
  });
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Sin estado",
    classes: "bg-[var(--light-gray)] text-[var(--gray-color)]",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-xl px-2.5 py-1 text-[11px] font-bold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

function SearchIcon({ className = "" }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon({ className = "" }) {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
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

function ChevronIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SummaryCard({ label, value, description, tone = "neutral" }) {
  const toneClasses = {
    neutral: "text-[var(--foreground)]",
    accent: "text-[var(--accent-color)]",
    green: "text-[var(--green-text-color)]",
    red: "text-[var(--red-text-color)]",
  };

  return (
    <div className="rounded-2xl  shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-[var(--background)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gray-color)]">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black tracking-tight ${toneClasses[tone]}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--gray-color)]">{description}</p>
    </div>
  );
}

function OrderCard({ order, onOpen }) {
  const isDelivery = order.entrega?.tipo === "domicilio";
  const isPending = order.status === "procesando";

  return (
    <button type="button" onClick={() => onOpen(order.id)}>
      <div
        className={` group w-full rounded-3xl  bg-[var(--background)] p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.1)]   rounded-3xl transition-all hover:-translate-y-0.5 hover:border border-[var(--accent-color)] hover:shadow-[0_10px_45px_rgba(0,0,0,0.08)] `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-black text-[var(--foreground)]">
                {order.cliente?.nombre || "Cliente sin nombre"}
              </p>

              <span className="text-xs text-[var(--gray-color)]">
                #{getOrderNumber(order.id)}
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--gray-color)]">
              {formatOrderDate(order.creadoEn)}
            </p>
          </div>

          <StatusBadge status={order.status} />
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--gray-color)]">
          {getOrderSummary(order)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--light-gray)] px-2.5 py-1 text-[11px] font-bold text-[var(--foreground)]">
            {isDelivery ? "Envío a domicilio" : "Recoge en local"}
          </span>

          <span className="rounded-full bg-[var(--light-gray)] px-2.5 py-1 text-[11px] font-bold text-[var(--gray-color)]">
            {getItemCount(order)}{" "}
            {getItemCount(order) === 1 ? "producto" : "productos"}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[var(--light-gray)] pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gray-color)]">
              Total
            </p>

            <p className="mt-1 text-xl font-black text-[var(--accent-color)]">
              {formatCurrency(order.total)}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--light-gray)] text-[var(--foreground)] transition-all group-hover:bg-[var(--accent-color)] group-hover:text-white">
            <ChevronIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[var(--light-gray)] py-3 last:border-b-0">
      <p className="text-sm text-[var(--gray-color)]">{label}</p>

      <p className="max-w-[65%] text-right text-sm font-bold text-[var(--foreground)]">
        {value || "—"}
      </p>
    </div>
  );
}

function ModalSection({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl  shadow-[0_1px_5px_rgba(0,0,0,0.1)] bg-[var(--background)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-lg font-black text-[var(--foreground)]">
        {title}
      </h3>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function OrderModal({ order, loadingAction, onClose, onAdvance, onCancel, onAccept }) {
  const [cancelMode, setCancelMode] = useState(false);

  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    setCancelMode(false);
    setCancellationReason("");
  }, [order?.id]);

  useEffect(() => {
    if (!order) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape" && !loadingAction) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, loadingAction, onClose]);

  if (!order) return null;

  const status = order.status;

  const isPreparing =
    order.status === "preparando" || order.status === "pendiente";

  const isDelivery = order.entrega?.tipo === "domicilio";
  const isPending = order.status === "procesando";

  const primaryActionLabel = isDelivery
    ? "Marcar en camino"
    : "Marcar como listo";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center sm:p-6">
      <button
        type="button"
        onClick={() => {
          if (!loadingAction) {
            onClose();
          }
        }}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar detalle"
      />

      <div className="relative flex  max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-[var(--background)] shadow-2xl sm:max-w-md sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--half-gray)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-black text-[var(--foreground)]">
                Pedido · {order.cliente?.nombre || "Cliente"}
              </h2>

              {/* <StatusBadge status={order.status} /> */}
            </div>

            <p className="mt-1 text-xs text-[var(--gray-color)]">
              #{getOrderNumber(order.id)} · {formatOrderDate(order.creadoEn)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(loadingAction)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--light-gray)] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white disabled:opacity-50"
            aria-label="Cerrar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {cancelMode ? (
          <div className="overflow-y-auto p-5 sm:p-6">
            <div className="mx-auto max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--red-text-color)]">
                Cancelar pedido
              </p>

              <h3 className="mt-1 text-xl font-black">
                ¿Por qué quieres cancelarlo?
              </h3>

              <p className="mt-2 text-sm text-[var(--gray-color)]">
                Selecciona el motivo. Este se guardará dentro del pedido y se
                enviará al cliente por WhatsApp.
              </p>

              <div className="mt-6 space-y-3">
                {RAZONES_CANCELACION.map((reason) => {
                  const selected = cancellationReason === reason;

                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setCancellationReason(reason)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold transition-all ${
                        selected
                          ? "border-[var(--red-text-color)] bg-[var(--red-color)] text-[var(--red-text-color)]"
                          : "border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--red-text-color)]"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-[var(--red-text-color)]"
                            : "border-[var(--half-gray)]"
                        }`}
                      >
                        {selected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--red-text-color)]" />
                        )}
                      </span>

                      {reason}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCancelMode(false);
                    setCancellationReason("");
                  }}
                  disabled={Boolean(loadingAction)}
                  className="rounded-xl bg-[var(--light-gray)] px-4 py-3 text-sm font-bold text-[var(--foreground)] disabled:opacity-60"
                >
                  Volver
                </button>

                <button
                  type="button"
                  disabled={!cancellationReason || Boolean(loadingAction)}
                  onClick={() => onCancel(order, cancellationReason)}
                  className="rounded-xl bg-[var(--red-text-color)] px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loadingAction === "cancel" ? "Cancelando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto bg-[var(--light-background)] p-4 sm:p-6">
              <div className="grid gap-4 ">
                <div className="space-y-4">
                  <ModalSection eyebrow="Información" title="Cliente">
                    <InfoRow label="Nombre" value={order.cliente?.nombre} />

                    <InfoRow label="Teléfono" value={order.cliente?.telefono} />

                    <InfoRow
                      label="Hora"
                      value={formatOrderDate(order.creadoEn)}
                    />

                    <InfoRow
                      label="Entrega"
                      value={
                        isDelivery ? "Envío a domicilio" : "Recoge en local"
                      }
                    />
                  </ModalSection>

                  {isDelivery && (
                    <ModalSection eyebrow="Entrega" title="Dirección">
                      <InfoRow label="Calle" value={order.entrega?.calle} />

                      <InfoRow label="Número" value={order.entrega?.numero} />

                      <InfoRow label="Colonia" value={order.entrega?.colonia} />

                      <InfoRow
                        label="Código postal"
                        value={order.entrega?.postal}
                      />
                    </ModalSection>
                  )}

                  <ModalSection eyebrow="Cobro" title="Pago">
                    <InfoRow
                      label="Método"
                      value={getPaymentLabel(order.pago?.metodo)}
                    />

                    {order.pago?.metodo === "efectivo" && (
                      <>
                        <InfoRow
                          label="Paga con"
                          value={
                            order.pago?.pagaCon !== undefined
                              ? formatCurrency(order.pago.pagaCon)
                              : "No especificado"
                          }
                        />

                        {order.pago?.cambio !== undefined && (
                          <InfoRow
                            label="Cambio"
                            value={formatCurrency(order.pago.cambio)}
                          />
                        )}
                      </>
                    )}
                  </ModalSection>

                  {order.status === "cancelado" && (
                    <div className="rounded-2xl border border-[var(--red-text-color)] bg-[var(--red-color)] p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--red-text-color)]">
                        Motivo de cancelación
                      </p>

                      <p className="mt-2 text-sm font-bold text-[var(--red-text-color)]">
                        {order.razonCancelacion || "No especificado"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <ModalSection eyebrow="Contenido" title="Productos">
                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => {
                        const optionLines = getOptionLines(item.options);

                        return (
                          <div
                            key={`${item.productId || item.name}-${index}`}
                            className="flex gap-3 rounded-xl bg-[var(--light-gray)] p-4"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--light-accent)] text-sm font-black text-[var(--accent-color)]">
                              {Number(item.quantity) || 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <p className="font-black text-[var(--foreground)]">
                                  {item.name || "Producto"}
                                </p>

                                {item.totalPrice !== undefined && (
                                  <p className="shrink-0 text-sm font-black text-[var(--foreground)]">
                                    {formatCurrency(item.totalPrice)}
                                  </p>
                                )}
                              </div>

                              {optionLines.map((line, optionIndex) => (
                                <p
                                  key={`${line}-${optionIndex}`}
                                  className="mt-1 text-xs leading-5 text-[var(--gray-color)]"
                                >
                                  {line}
                                </p>
                              ))}

                              {item.note && (
                                <p className="mt-2 rounded-lg bg-[var(--light-accent)] px-3 py-2 text-xs font-bold text-[var(--accent-color)]">
                                  Nota: {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {(order.items || []).length === 0 && (
                        <p className="py-6 text-center text-sm text-[var(--gray-color)]">
                          No hay productos registrados en este pedido.
                        </p>
                      )}
                    </div>
                  </ModalSection>

                  <section className="rounded-2xl bg-[var(--foreground)] p-5 text-white">
                    <div className="space-y-3">
                      {Number(order.costoEnvio) > 0 && (
                        <div className="flex items-center justify-between text-sm text-white/65">
                          <span>Envío</span>

                          <span>{formatCurrency(order.costoEnvio)}</span>
                        </div>
                      )}

                      <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                            Total
                          </p>

                          <p className="mt-1 text-sm text-white/60">
                            {getItemCount(order)}{" "}
                            {getItemCount(order) === 1
                              ? "producto"
                              : "productos"}
                          </p>
                        </div>

                        <p className="text-3xl font-black text-[var(--light-accent)]">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[var(--half-gray)] bg-[var(--background)] p-4  sm:items-center sm:justify-end sm:px-6">
              {isPending && (
                <>
                  <button
                    type="button"
                    disabled={Boolean(loadingAction)}
                    onClick={() => setCancelMode(true)}
                    className="h-[46px] rounded-xl w-full border border-[var(--red-text-color)] bg-[var(--background)] px-5 py-3 text-sm font-bold text-[var(--red-text-color)] transition-all hover:bg-[var(--red-color)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    Rechazar pedido
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(loadingAction)}
                    onClick={() => onAccept(order)}
                    className="h-[46px] rounded-xl w-full bg-[var(--accent-color)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(237,64,11,0.24)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    Aceptar pedido
                  </button>
                </>
              )}

              {isPreparing && (
                <>
                  <button
                    type="button"
                    disabled={Boolean(loadingAction)}
                    onClick={() => setCancelMode(true)}
                    className="h-[46px] rounded-xl w-full border border-[var(--red-text-color)] bg-[var(--background)] px-5 py-3 text-sm font-bold text-[var(--red-text-color)] transition-all hover:bg-[var(--red-color)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(loadingAction)}
                    onClick={() => onAdvance(order)}
                    className="h-[46px] rounded-xl w-full bg-[var(--accent-color)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(237,64,11,0.24)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loadingAction === "advance"
                      ? "Guardando..."
                      : primaryActionLabel}
                  </button>
                </>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyOrders({ search }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--half-gray)] bg-[var(--background)] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--light-accent)] text-2xl font-black text-[var(--accent-color)]">
        P
      </div>

      <h3 className="mt-4 text-xl font-black text-[var(--foreground)]">
        {search ? "No encontramos pedidos" : "No hay pedidos por el momento"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--gray-color)]">
        {search
          ? "Prueba con otro nombre, teléfono o número de pedido."
          : "Los pedidos nuevos aparecerán aquí automáticamente en tiempo real."}
      </p>
    </div>
  );
}

export default function OrdersPanel({ restaurantId }) {
  const [orders, setOrders] = useState([]);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [filter, setFilter] = useState("todos");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [loadingAction, setLoadingAction] = useState("");

  const [toast, setToast] = useState(null);

  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const knownOrderIdsRef = useRef(null);

  const audioContextRef = useRef(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const pendentOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "preparando" || order.status === "procesando",
      ),
    [orders],
  );

  const readyOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "listo" || order.status === "en_camino",
      ),
    [orders],
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "entregado"),
    [orders],
  );

  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "cancelado"),
    [orders],
  );

  const todayOrders = useMemo(() => {
    const today = new Date();

    return orders.filter((order) => {
      const date = timestampToDate(order.creadoEn);

      return date && sameDay(date, today);
    });
  }, [orders]);

  const todaySales = useMemo(
    () =>
      todayOrders
        .filter((order) => order.status !== "cancelado")
        .reduce((total, order) => total + (Number(order.total) || 0), 0),
    [todayOrders],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = {
        todos: true,
        procesando: order.status === "procesando",
        activos: order.status === "preparando" || order.status === "pendiente",
        listos: order.status === "listo" || order.status === "en_camino",
        entregados: order.status === "entregado",
        cancelados: order.status === "cancelado",
      }[filter];

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        order.id,
        order.cliente?.nombre,
        order.cliente?.telefono,
        getOrderSummary(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [orders, filter, search]);

  const groupedOrders = useMemo(() => {
    const groups = [
      {
        key: "pending",
        title: "Procesando",
        description: "Pedidos que aún no se han aceptado o cancelado.",
        statuses: ["procesando"],
      },
      {
        key: "active",
        title: "En curso",
        description: "Pedidos que se están preparando.",
        statuses: ["pendiente", "preparando"],
      },
      {
        key: "ready",
        title: "Listos",
        description: "Pedidos listos para recoger o en proceso de entrega.",
        statuses: ["listo", "en_camino"],
      },
      {
        key: "delivered",
        title: "Entregados",
        description: "Pedidos finalizados correctamente.",
        statuses: ["entregado"],
      },
      {
        key: "cancelled",
        title: "Cancelados",
        description: "Pedidos que no pudieron completarse.",
        statuses: ["cancelado"],
      },
    ];

    return groups
      .map((group) => ({
        ...group,
        orders: filteredOrders.filter((order) =>
          group.statuses.includes(order.status),
        ),
      }))
      .filter((group) => group.orders.length > 0);
  }, [filteredOrders]);

  function showToast(message, tone = "success") {
    setToast({
      message,
      tone,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 4200);
  }

  async function enableAlerts() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (AudioContextClass) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }
      }

      if ("Notification" in window) {
        const permission = await Notification.requestPermission();

        if (permission === "denied") {
          showToast("El navegador bloqueó las notificaciones.", "error");

          return;
        }
      }

      setAlertsEnabled(true);

      showToast("Alertas de pedidos activadas.");
    } catch (error) {
      console.error(error);

      showToast("No se pudieron activar las alertas.", "error");
    }
  }

  function playNewOrderAlert(order) {
    try {
      const context = audioContextRef.current;

      if (context && context.state === "running") {
        const playTone = (frequency, start, duration) => {
          const oscillator = context.createOscillator();

          const gain = context.createGain();

          oscillator.type = "sine";
          oscillator.frequency.value = frequency;

          gain.gain.setValueAtTime(0, start);

          gain.gain.linearRampToValueAtTime(0.18, start + 0.02);

          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

          oscillator.connect(gain);
          gain.connect(context.destination);

          oscillator.start(start);
          oscillator.stop(start + duration);
        };

        const now = context.currentTime;

        playTone(880, now, 0.2);

        playTone(1175, now + 0.2, 0.3);
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Nuevo pedido en Platillo", {
          body: `${order.cliente?.nombre || "Cliente"} · ${formatCurrency(order.total)}`,
          icon: "/logo.png",
        });
      }
    } catch (error) {
      console.error("No se pudo reproducir la alerta:", error);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAlertsEnabled(
        "Notification" in window && Notification.permission === "granted",
      );
    }
  }, []);

  useEffect(() => {
    if (!restaurantId) return undefined;

    setLoading(true);
    setLoadError("");

    const ordersQuery = query(
      collection(db, "orders"),
      where("restaurantId", "==", restaurantId),
      orderBy("creadoEn", "desc"),
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((orderDocument) => ({
          id: orderDocument.id,
          ...orderDocument.data(),
        }));

        if (knownOrderIdsRef.current === null) {
          knownOrderIdsRef.current = new Set(data.map((order) => order.id));
        } else {
          const newOrders = data.filter(
            (order) => !knownOrderIdsRef.current.has(order.id),
          );

          if (newOrders.length > 0) {
            playNewOrderAlert(newOrders[0]);

            showToast(
              `Nuevo pedido de ${newOrders[0].cliente?.nombre || "un cliente"}`,
            );
          }

          knownOrderIdsRef.current = new Set(data.map((order) => order.id));
        }

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error obteniendo pedidos:", error);

        setLoadError("No se pudieron cargar los pedidos.");

        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [restaurantId]);

  async function sendWhatsApp(endpoint, body) {
    const firebaseUser = await getFirebaseUser();

    const token = await firebaseUser.getIdToken();

    const response = await fetch(
      `https://platillo.mx/api/whatsapp/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || "No se pudo enviar WhatsApp.");
    }

    return responseText;
  }

  async function advanceOrder(order) {
    if (loadingAction) return;

    setLoadingAction("advance");

    try {
      const isDelivery = order.entrega?.tipo === "domicilio";

      const newStatus = isDelivery ? "en_camino" : "listo";

      const endpoint = isDelivery ? "pedido-en-camino" : "pedido-listo";

      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus,
      });

      try {
        await sendWhatsApp(endpoint, {
          orderId: order.id,
        });

        showToast(
          isDelivery
            ? "Pedido marcado en camino y cliente notificado."
            : "Pedido marcado como listo y cliente notificado.",
        );
      } catch (whatsappError) {
        console.error("Error enviando WhatsApp:", whatsappError);

        showToast(
          "El estado cambió, pero no se pudo enviar el mensaje de WhatsApp.",
          "warning",
        );
      }

      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error actualizando pedido:", error);

      showToast("No se pudo actualizar el pedido.", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function acceptOrder(order) {
    if (loadingAction) return;

    setLoadingAction("accept");

    try {
      const newStatus = "preparando";

      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus,
      });

      showToast("Pedido marcado como preparando y cliente notificado.");

      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error actualizando pedido:", error);

      showToast("No se pudo actualizar el pedido.", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function cancelOrder(order, reason) {
    if (loadingAction) return;

    setLoadingAction("cancel");

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "cancelado",
        razonCancelacion: reason,
      });

      try {
        await sendWhatsApp("pedido-cancelado", {
          orderId: order.id,
          razonCancelacion: reason,
        });

        showToast("Pedido cancelado y cliente notificado.");
      } catch (whatsappError) {
        console.error("Error enviando WhatsApp:", whatsappError);

        showToast(
          "El pedido se canceló, pero no se pudo enviar el mensaje de WhatsApp.",
          "warning",
        );
      }

      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error cancelando pedido:", error);

      showToast("No se pudo cancelar el pedido.", "error");
    } finally {
      setLoadingAction("");
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
            Operación
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
            Pedidos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
            Recibe y administra los pedidos de tu restaurante en tiempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={enableAlerts}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all ${
            alertsEnabled
              ? "bg-[var(--green-color)] text-[var(--green-text-color)]"
              : "bg-[var(--accent-color)] text-white hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(237,64,11,0.22)]"
          }`}
        >
          <BellIcon className="h-4 w-4" />

          {alertsEnabled ? "Alertas activas" : "Activar alertas"}
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="En curso"
          value={pendentOrders.length}
          description="Pedidos pendientes"
          tone="accent"
        />

        <SummaryCard
          label="Listos"
          value={readyOrders.length}
          description="Listos o en camino"
          tone="green"
        />

        <SummaryCard
          label="Pedidos hoy"
          value={todayOrders.length}
          description="Recibidos durante el día"
        />

        <SummaryCard
          label="Venta de hoy"
          value={formatCurrency(todaySales)}
          description="Sin pedidos cancelados"
          tone="accent"
        />
      </section>

      <section className="rounded-2xl  shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-[var(--background)] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-color)]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente, teléfono o pedido"
              className="h-11 w-full rounded-xl border border-[var(--half-gray)] bg-[var(--light-background)] pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--gray-color)] "
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
            {FILTERS.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-[var(--accent-color)] text-white"
                      : "bg-[var(--light-gray)] text-[var(--foreground)] hover:text-[var(--accent-color)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {loadError && (
        <div className="rounded-2xl border border-[var(--red-text-color)] bg-[var(--red-color)] px-4 py-3 text-sm font-bold text-[var(--red-text-color)]">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl bg-[var(--light-gray)]"
            />
          ))}
        </div>
      ) : groupedOrders.length === 0 ? (
        <EmptyOrders search={search} />
      ) : (
        <div className="space-y-8">
          {groupedOrders.map((group) => (
            <section key={group.key}>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
                    {group.orders.length}{" "}
                    {group.orders.length === 1 ? "pedido" : "pedidos"}
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">
                    {group.title}
                  </h2>

                  <p className="mt-1 text-xs text-[var(--gray-color)]">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onOpen={setSelectedOrderId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <OrderModal
        order={selectedOrder}
        loadingAction={loadingAction}
        onClose={() => {
          if (!loadingAction) {
            setSelectedOrderId(null);
          }
        }}
        onAdvance={advanceOrder}
        onCancel={cancelOrder}
        onAccept={acceptOrder}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[150] max-w-sm rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${
            toast.tone === "error"
              ? "border-[var(--red-text-color)] bg-[var(--red-color)] text-[var(--red-text-color)]"
              : toast.tone === "warning"
                ? "border-[var(--accent-color)] bg-[var(--light-accent)] text-[var(--accent-color)]"
                : "border-[var(--green-text-color)] bg-[var(--green-color)] text-[var(--green-text-color)]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
