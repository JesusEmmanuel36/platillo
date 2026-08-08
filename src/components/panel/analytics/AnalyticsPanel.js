"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";

const FILTERS = [
  { value: "Hoy", label: "Hoy" },
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "Todo", label: "Todo" },
];

const PAYMENT_METHODS = ["efectivo", "tarjeta", "transferencia"];

const PAYMENT_LABELS = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function formatCutDate(date = new Date()) {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startDateForFilter(filter) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "Hoy") return today;

  if (filter === "7d") {
    const date = new Date(today);
    date.setDate(date.getDate() - 7);
    return date;
  }

  if (filter === "30d") {
    const date = new Date(today);
    date.setDate(date.getDate() - 30);
    return date;
  }

  return null;
}

function parseDate(createdAt) {
  if (!createdAt) return null;

  if (typeof createdAt.toDate === "function") {
    return createdAt.toDate();
  }

  if (createdAt?.seconds) {
    return new Date(createdAt.seconds * 1000);
  }

  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function filterByRange(documents, filter) {
  const start = startDateForFilter(filter);

  if (!start) return documents;

  return documents.filter((document) => {
    const date = parseDate(document.creadoEn);
    return date && date >= start;
  });
}

function groupByDay(documents, filter) {
  const map = {};
  const today = new Date();
  const days = filter === "Hoy" ? 1 : filter === "7d" ? 7 : 30;

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    date.setHours(0, 0, 0, 0);

    const key = date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

    map[key] = 0;
  }

  documents.forEach((document) => {
    const date = parseDate(document.creadoEn);
    if (!date) return;

    const key = date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

    if (map[key] !== undefined) {
      map[key] += Number(document.total) || 0;
    }
  });

  return Object.entries(map).map(([day, total]) => ({
    day,
    total,
  }));
}

function groupByHour(orders) {
  const map = {};

  for (let hour = 0; hour < 24; hour += 1) {
    map[hour] = 0;
  }

  orders.forEach((order) => {
    const date = parseDate(order.creadoEn);
    if (!date) return;

    map[date.getHours()] += Number(order.total) || 0;
  });

  return Object.entries(map)
    .map(([hour, total]) => ({
      hour: `${Number(hour)}h`,
      total,
    }))
    .filter((item) => item.total > 0);
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

function DownloadIcon({ className = "" }) {
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ReceiptIcon({ className = "" }) {
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

function ModalShell({ open, onClose, title, description, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar modal"
      />

      <div
        className={`relative flex max-h-[94vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-[2rem] bg-[var(--background)] shadow-2xl sm:rounded-[2rem]`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--half-gray)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-[var(--gray-color)]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--light-gray)] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white"
            aria-label="Cerrar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}

function MetricCard({ label, value, description, tone = "neutral" }) {
  const tones = {
    neutral: "text-[var(--foreground)]",
    accent: "text-[var(--accent-color)]",
    green: "text-[var(--green-text-color)]",
    red: "text-[var(--red-text-color)]",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
      <div className="absolute right-[-45px] top-[-45px] h-28 w-28 rounded-full bg-[var(--light-accent)] opacity-20" />

      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gray-color)]">
          {label}
        </p>

        <p className={`mt-2 text-3xl font-black tracking-tight ${tones[tone]}`}>
          {value}
        </p>

        <p className="mt-1 text-xs text-[var(--gray-color)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ eyebrow, title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[var(--gray-color)]">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function VerticalBarChart({ data, labelKey, valueKey, emptyMessage }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);

  if (data.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl bg-[var(--light-gray)] px-6 text-center text-sm text-[var(--gray-color)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="flex min-h-64 items-end gap-3"
        style={{ minWidth: `${Math.max(data.length * 62, 560)}px` }}
      >
        {data.map((item, index) => {
          const value = Number(item[valueKey]) || 0;
          const height = value > 0 ? Math.max((value / max) * 150, 8) : 2;

          return (
            <div
              key={`${item[labelKey]}-${index}`}
              className="flex min-w-12 flex-1 flex-col items-center justify-end"
              title={`${item[labelKey]}: ${formatCurrency(value)}`}
            >
              <p className="mb-2 min-h-4 text-[10px] font-bold text-[var(--gray-color)]">
                {value > 0 ? formatCompactCurrency(value) : ""}
              </p>

              <div className="flex h-40 w-full items-end justify-center rounded-t-xl bg-[var(--light-gray)]/60 px-2 pt-2">
                <div
                  className="w-full max-w-9 rounded-t-lg bg-[var(--accent-color)] transition-all duration-300"
                  style={{ height: `${height}px` }}
                />
              </div>

              <p className="mt-2 w-full truncate text-center text-[10px] font-semibold text-[var(--gray-color)]">
                {item[labelKey]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((item) => item.quantity), 1);

  if (data.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl bg-[var(--light-gray)] px-6 text-center text-sm text-[var(--gray-color)]">
        Todavía no hay productos suficientes para mostrar este ranking.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((item, index) => {
        const percentage = Math.max((item.quantity / max) * 100, 4);

        return (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--light-accent)] text-xs font-black text-[var(--accent-color)]">
                  {index + 1}
                </span>

                <p className="truncate text-sm font-bold text-[var(--foreground)]">
                  {item.name}
                </p>
              </div>

              <p className="shrink-0 text-sm font-black text-[var(--foreground)]">
                {item.quantity}
              </p>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--light-gray)]">
              <div
                className="h-full rounded-full bg-[var(--accent-color)]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ManualSaleModal({ open, onClose, restaurantId, onSuccess, onError }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("efectivo");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
      setMethod("efectivo");
      setNote("");
      setFormError("");
    }
  }, [open]);

  async function saveManualSale(event) {
    event.preventDefault();

    const total = Number.parseFloat(amount);

    if (!total || total <= 0) {
      setFormError("Ingresa un monto válido mayor a cero.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      await addDoc(collection(db, "manual_sales"), {
        restaurantId,
        total,
        metodo: method,
        nota: note.trim(),
        creadoEn: new Date(),
      });

      onClose();
      onSuccess("Venta manual registrada correctamente.");
    } catch (error) {
      console.error("Error registrando venta manual:", error);
      setFormError("No se pudo registrar la venta manual.");
      onError("No se pudo registrar la venta manual.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      title="Registrar venta manual"
      description="Agrega una venta realizada directamente en el local."
    >
      <form onSubmit={saveManualSale} className="overflow-y-auto p-5 sm:p-6">
        {formError && (
          <div className="mb-5 rounded-xl border border-[var(--red-text-color)] bg-[var(--red-color)] px-4 py-3 text-sm font-bold text-[var(--red-text-color)]">
            {formError}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-bold text-[var(--foreground)]">
            Monto
          </span>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--gray-color)]">
              $
            </span>

            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-12 w-full rounded-xl border border-[var(--half-gray)] bg-[var(--background)] pl-8 pr-4 text-sm font-semibold text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--gray-color)] focus:border-[var(--accent-color)]"
            />
          </div>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-[var(--foreground)]">
            Método de pago
          </legend>

          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((paymentMethod) => {
              const selected = method === paymentMethod;

              return (
                <button
                  key={paymentMethod}
                  type="button"
                  onClick={() => setMethod(paymentMethod)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    selected
                      ? "border-[var(--accent-color)] bg-[var(--light-accent)] text-[var(--accent-color)]"
                      : "border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent-color)]"
                  }`}
                >
                  {PAYMENT_LABELS[paymentMethod]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-[var(--foreground)]">
            Nota <span className="font-normal text-[var(--gray-color)]">(opcional)</span>
          </span>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ej. 2 tacos y un refresco"
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-[var(--half-gray)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--gray-color)] focus:border-[var(--accent-color)]"
          />
        </label>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl bg-[var(--light-gray)] px-4 py-3 text-sm font-bold text-[var(--foreground)] disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--accent-color)] px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function CashCloseModal({ open, onClose, ordersToday, manualSalesToday, restaurantName, onError }) {
  const [downloading, setDownloading] = useState(false);

  const totalsByPayment = useMemo(() => {
    const totals = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
    };

    ordersToday.forEach((order) => {
      const method = order.pago?.metodo;

      if (totals[method] !== undefined) {
        totals[method] += Number(order.total) || 0;
      }
    });

    manualSalesToday.forEach((sale) => {
      const method = sale.metodo;

      if (totals[method] !== undefined) {
        totals[method] += Number(sale.total) || 0;
      }
    });

    return totals;
  }, [ordersToday, manualSalesToday]);

  const total = Object.values(totalsByPayment).reduce(
    (accumulator, current) => accumulator + current,
    0,
  );

  const appCount = ordersToday.length;
  const manualCount = manualSalesToday.length;
  const movementCount = appCount + manualCount;
  const cutDate = formatCutDate();
  const generatedAt = formatTime();

  function drawPdfRow(pdf, y, label, value, bold = false) {
    pdf.setDrawColor(237, 237, 237);
    pdf.line(20, y + 8, 190, y + 8);

    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setTextColor(82, 82, 91);
    pdf.setFontSize(bold ? 12 : 10.5);
    pdf.text(label, 22, y);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(bold ? 237 : 24, bold ? 64 : 24, bold ? 11 : 27);
    pdf.text(value, 188, y, { align: "right" });
  }

  async function downloadCutPdf() {
    try {
      setDownloading(true);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFillColor(237, 64, 11);
      pdf.roundedRect(20, 15, 170, 4, 2, 2, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(26);
      pdf.setTextColor(237, 64, 11);
      pdf.text("Platillo", 20, 36);

      pdf.setFontSize(17);
      pdf.setTextColor(24, 24, 27);
      pdf.text("Corte diario", 20, 48);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(113, 113, 122);
      pdf.text(restaurantName || "Restaurante", 20, 56);
      pdf.text(cutDate, 20, 62);
      pdf.text(`Generado ${generatedAt}`, 190, 36, { align: "right" });

      pdf.setFillColor(255, 244, 239);
      pdf.setDrawColor(255, 217, 199);
      pdf.roundedRect(20, 72, 170, 35, 5, 5, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(154, 52, 18);
      pdf.text("VENTA TOTAL DEL DÍA", 28, 84);

      pdf.setFontSize(25);
      pdf.setTextColor(237, 64, 11);
      pdf.text(formatCurrency(total), 28, 99);

      pdf.setFontSize(9);
      pdf.setTextColor(82, 82, 91);
      pdf.text("DESGLOSE POR MÉTODO DE PAGO", 20, 124);

      drawPdfRow(pdf, 138, "Efectivo", formatCurrency(totalsByPayment.efectivo));
      drawPdfRow(pdf, 152, "Tarjeta", formatCurrency(totalsByPayment.tarjeta));
      drawPdfRow(pdf, 166, "Transferencia", formatCurrency(totalsByPayment.transferencia));
      drawPdfRow(pdf, 180, "Total", formatCurrency(total), true);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(82, 82, 91);
      pdf.text("MOVIMIENTOS REGISTRADOS", 20, 205);

      const stats = [
        { label: "Pedidos app", value: appCount },
        { label: "Ventas manuales", value: manualCount },
        { label: "Total movimientos", value: movementCount },
      ];

      stats.forEach((stat, index) => {
        const x = 20 + index * 58;

        pdf.setFillColor(250, 250, 250);
        pdf.setDrawColor(228, 228, 231);
        pdf.roundedRect(x, 214, 54, 30, 4, 4, "FD");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(19);
        pdf.setTextColor(24, 24, 27);
        pdf.text(String(stat.value), x + 27, 227, { align: "center" });

        pdf.setFontSize(8);
        pdf.setTextColor(113, 113, 122);
        pdf.text(stat.label.toUpperCase(), x + 27, 237, { align: "center" });
      });

      pdf.setDrawColor(228, 228, 231);
      pdf.line(20, 266, 190, 266);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(161, 161, 170);
      pdf.text("Reporte generado automáticamente por Platillo.", 105, 275, {
        align: "center",
      });

      const now = new Date();
      const dateName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      pdf.save(`Corte_${dateName}.pdf`);
    } catch (error) {
      console.error("Error generando corte:", error);
      onError("No se pudo generar el corte en PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={() => {
        if (!downloading) onClose();
      }}
      title="Corte de hoy"
      description={cutDate}
      maxWidth="max-w-3xl"
    >
      <div className="overflow-y-auto bg-[var(--light-gray)] p-4 sm:p-6">
        <section className="rounded-2xl border border-[var(--accent-color)] bg-[var(--light-accent)] p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
            Venta total del día
          </p>

          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--accent-color)]">
            {formatCurrency(total)}
          </p>

          <p className="mt-2 text-xs text-[var(--accent-color)]/80">
            Generado a las {generatedAt}
          </p>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
              Métodos de pago
            </p>

            <div className="mt-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method}
                  className="flex items-center justify-between gap-4 border-b border-[var(--light-gray)] py-3"
                >
                  <p className="text-sm text-[var(--gray-color)]">
                    {PAYMENT_LABELS[method]}
                  </p>

                  <p className="text-sm font-black text-[var(--foreground)]">
                    {formatCurrency(totalsByPayment[method])}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 pt-4">
                <p className="font-black text-[var(--foreground)]">Total</p>
                <p className="text-xl font-black text-[var(--accent-color)]">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
              Movimientos
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1">
              {[
                { label: "App", value: appCount },
                { label: "Manuales", value: manualCount },
                { label: "Total", value: movementCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-[var(--light-gray)] p-3 text-center lg:flex lg:items-center lg:justify-between lg:text-left"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--gray-color)]">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xl font-black text-[var(--foreground)] lg:mt-0">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[var(--half-gray)] bg-[var(--background)] p-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={downloading}
          className="rounded-xl bg-[var(--light-gray)] px-5 py-3 text-sm font-bold text-[var(--foreground)] disabled:opacity-60"
        >
          Cerrar
        </button>

        <button
          type="button"
          onClick={downloadCutPdf}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" />
          {downloading ? "Generando PDF..." : "Descargar corte en PDF"}
        </button>
      </footer>
    </ModalShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--half-gray)] bg-[var(--background)] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--light-accent)] text-2xl font-black text-[var(--accent-color)]">
        A
      </div>

      <h3 className="mt-4 text-xl font-black text-[var(--foreground)]">
        Todavía no hay datos
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--gray-color)]">
        Las ventas, productos populares y horas pico aparecerán cuando el restaurante registre pedidos o ventas manuales.
      </p>
    </div>
  );
}

export default function AnalyticsPanel({ restaurantId, restaurantName }) {
  const [filter, setFilter] = useState("Hoy");
  const [orders, setOrders] = useState([]);
  const [manualSales, setManualSales] = useState([]);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [cutModalOpen, setCutModalOpen] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [manualSalesLoaded, setManualSalesLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!restaurantId) return undefined;

    setLoadError("");

    const ordersQuery = query(
      collection(db, "orders"),
      where("restaurantId", "==", restaurantId),
      orderBy("creadoEn", "desc"),
    );

    const manualSalesQuery = query(
      collection(db, "manual_sales"),
      where("restaurantId", "==", restaurantId),
      orderBy("creadoEn", "desc"),
    );

    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );
        setOrdersLoaded(true);
      },
      (error) => {
        console.error("Error cargando pedidos:", error);
        setLoadError("No se pudieron cargar los pedidos.");
        setOrdersLoaded(true);
      },
    );

    const unsubscribeManualSales = onSnapshot(
      manualSalesQuery,
      (snapshot) => {
        setManualSales(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })),
        );
        setManualSalesLoaded(true);
      },
      (error) => {
        console.error("Error cargando ventas manuales:", error);
        setLoadError("No se pudieron cargar las ventas manuales.");
        setManualSalesLoaded(true);
      },
    );

    return () => {
      unsubscribeOrders();
      unsubscribeManualSales();
    };
  }, [restaurantId]);

  const filteredOrders = useMemo(
    () => filterByRange(orders, filter),
    [orders, filter],
  );

  const filteredManualSales = useMemo(
    () => filterByRange(manualSales, filter),
    [manualSales, filter],
  );

  const allFiltered = useMemo(
    () => [...filteredOrders, ...filteredManualSales],
    [filteredOrders, filteredManualSales],
  );

  const totalSales = useMemo(
    () =>
      allFiltered.reduce(
        (total, movement) => total + (Number(movement.total) || 0),
        0,
      ),
    [allFiltered],
  );

  const movementCount = allFiltered.length;
  const averageTicket = movementCount > 0 ? totalSales / movementCount : 0;

  const ordersToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return orders.filter((order) => {
      const date = parseDate(order.creadoEn);
      return date && date >= start;
    });
  }, [orders]);

  const manualSalesToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return manualSales.filter((sale) => {
      const date = parseDate(sale.creadoEn);
      return date && date >= start;
    });
  }, [manualSales]);

  const totalToday = useMemo(
    () =>
      [...ordersToday, ...manualSalesToday].reduce(
        (total, movement) => total + (Number(movement.total) || 0),
        0,
      ),
    [ordersToday, manualSalesToday],
  );

  const dailyData = useMemo(() => {
    if (filter === "Todo") return [];
    return groupByDay(allFiltered, filter);
  }, [allFiltered, filter]);

  const hourlyData = useMemo(
    () => groupByHour(filteredOrders),
    [filteredOrders],
  );

  const topProducts = useMemo(() => {
    const productCounts = {};

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Producto";
        productCounts[name] =
          (productCounts[name] || 0) + (Number(item.quantity) || 1);
      });
    });

    return Object.entries(productCounts)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [filteredOrders]);

  const loading = !ordersLoaded || !manualSalesLoaded;
  const hasData = orders.length > 0 || manualSales.length > 0;

  function showToast(message, tone = "success") {
    setToast({ message, tone });

    window.setTimeout(() => {
      setToast(null);
    }, 4200);
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
            Resultados
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
            Analíticas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
            Consulta ventas, pedidos, productos populares y las horas con mayor actividad.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setCutModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--half-gray)] bg-[var(--background)] px-4 text-sm font-bold text-[var(--foreground)] transition-all hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            <ReceiptIcon className="h-4 w-4" />
            Corte de hoy
          </button>

          <button
            type="button"
            onClick={() => setManualModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent-color)] px-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(237,64,11,0.22)]"
          >
            <PlusIcon className="h-4 w-4" />
            Registrar venta manual
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--half-gray)] bg-[var(--background)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[var(--foreground)]">
              Periodo analizado
            </p>
            <p className="mt-1 text-xs text-[var(--gray-color)]">
              Los datos y las gráficas cambian con este filtro.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)]"
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
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-[var(--light-gray)]"
              />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-[var(--light-gray)]"
              />
            ))}
          </div>
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Ventas"
              value={formatCurrency(totalSales)}
              description="Pedidos y ventas manuales"
              tone="accent"
            />

            <MetricCard
              label="Movimientos"
              value={movementCount}
              description="Total dentro del periodo"
            />

            <MetricCard
              label="Ticket promedio"
              value={formatCurrency(averageTicket)}
              description="Promedio por movimiento"
              tone="green"
            />

            <MetricCard
              label="Origen"
              value={`${filteredOrders.length} app`}
              description={`${filteredManualSales.length} ventas manuales`}
            />
          </section>

          {filter !== "Todo" && (
            <SectionCard
              eyebrow="Tendencia"
              title="Ventas en el tiempo"
              description="Ingresos combinados de pedidos y ventas manuales."
            >
              <VerticalBarChart
                data={dailyData}
                labelKey="day"
                valueKey="total"
                emptyMessage="Todavía no hay ventas en este periodo."
              />
            </SectionCard>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionCard
              eyebrow="Catálogo"
              title="Top productos"
              description="Productos más vendidos desde pedidos en línea."
            >
              <HorizontalBarChart data={topProducts} />
            </SectionCard>

            <SectionCard
              eyebrow="Actividad"
              title="Horas pico"
              description="Ventas recibidas por hora desde pedidos en línea."
            >
              <VerticalBarChart
                data={hourlyData}
                labelKey="hour"
                valueKey="total"
                emptyMessage="Todavía no hay suficientes pedidos para calcular horas pico."
              />
            </SectionCard>
          </div>

          <button
            type="button"
            onClick={() => setCutModalOpen(true)}
            className="group flex w-full flex-col gap-5 rounded-[2rem] border border-[var(--half-gray)] bg-[var(--foreground)] p-6 text-left text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(0,0,0,0.14)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--light-accent)]">
                Corte de caja
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Corte de hoy
              </h2>

              <p className="mt-2 text-sm text-white/60">
                {ordersToday.length + manualSalesToday.length} movimientos · {ordersToday.length} app · {manualSalesToday.length} manuales
              </p>
            </div>

            <div className="flex items-end justify-between gap-6 sm:flex-col sm:items-end">
              <p className="text-3xl font-black text-[var(--light-accent)]">
                {formatCurrency(totalToday)}
              </p>

              <span className="text-sm font-bold text-white/65 transition-transform group-hover:translate-x-1">
                Ver detalle →
              </span>
            </div>
          </button>
        </>
      )}

      <ManualSaleModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        restaurantId={restaurantId}
        onSuccess={(message) => showToast(message)}
        onError={(message) => showToast(message, "error")}
      />

      <CashCloseModal
        open={cutModalOpen}
        onClose={() => setCutModalOpen(false)}
        ordersToday={ordersToday}
        manualSalesToday={manualSalesToday}
        restaurantName={restaurantName}
        onError={(message) => showToast(message, "error")}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[150] max-w-sm rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${
            toast.tone === "error"
              ? "border-[var(--red-text-color)] bg-[var(--red-color)] text-[var(--red-text-color)]"
              : "border-[var(--green-text-color)] bg-[var(--green-color)] text-[var(--green-text-color)]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}