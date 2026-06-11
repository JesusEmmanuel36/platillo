// app/[slug]/pedidos/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

const statusConfig = {
  preparando: {
    label: "Preparando tu pedido",
    desc: "El restaurante está preparando tu pedido",
    bg: "bg-[#ffecce]",
    color: "text-[#ff9d00]",
    dot: "bg-[#ff9d00]",
  },
  listo: {
    label: "¡Pedido listo!",
    desc: "Tu pedido está listo para recoger o entrega",
    bg: "bg-[#ceffd2]",
    color: "text-[#2e7d32]",
    dot: "bg-[#2e7d32]",
  },
  entregado: {
    label: "Pedido entregado",
    desc: "Tu pedido fue entregado",
    bg: "bg-[#e8eaf6]",
    color: "text-[#3949ab]",
    dot: "bg-[#3949ab]",
  },
  cancelado: {
    label: "Pedido cancelado",
    desc: "El restaurante canceló tu pedido",
    bg: "bg-[#ffa6a6]",
    color: "text-[#c62828]",
    dot: "bg-[#c62828]",
  },
  pendiente_pago: {
    label: "Pendiente de pago",
    desc: "Esperando confirmación del pago",
    bg: "bg-[#f0f0f0]",
    color: "text-[#555]",
    dot: "bg-[#555]",
  },
};

function PedidoCard({ orderId }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setPedido({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white rounded-[14px] p-4 border border-[#e5e5e5] animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="bg-white rounded-[14px] p-4 border border-[#e5e5e5]">
        <p className="text-[14px] text-[var(--gray-color)]">
          Pedido no encontrado
        </p>
      </div>
    );
  }

  const cfg = statusConfig[pedido.status] ?? {
    label: pedido.status,
    desc: "",
    bg: "bg-[#f0f0f0]",
    color: "text-[#555]",
    dot: "bg-[#555]",
  };

  const fecha = pedido.creadoEn?.seconds
    ? new Date(pedido.creadoEn.seconds * 1000)
    : new Date(pedido.creadoEn);

  const horaFormateada = fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-[14px] border border-[#e5e5e5] overflow-hidden">
      {/* Header status */}
      <div className={`${cfg.bg} px-4 py-3 flex items-center gap-2`}>
        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <p className={`font-semibold text-[14px] ${cfg.color}`}>{cfg.label}</p>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Info cliente y hora */}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-[15px]">{pedido.cliente?.nombre}</p>
          <p className="text-[13px] text-[var(--gray-color)]">
            {horaFormateada}
          </p>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-1">
          {pedido.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-start">
              <p className="text-[14px]">
                <span className="font-semibold text-[var(--accent-color)]">
                  ×{item.quantity}{" "}
                </span>
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Entrega */}
        <div className="flex justify-between items-center text-[13px] text-[var(--gray-color)]">
          <p>
            {pedido.entrega?.tipo === "local"
              ? "Recoge en local"
              : "Envío a domicilio"}
          </p>
          <p className="font-semibold text-[var(--accent-color)] text-[16px]">
            ${pedido.total}
          </p>
        </div>

        {/* Método de pago */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] bg-[var(--light-gray)] px-2 py-1 rounded-[6px] capitalize">
            {pedido.pago?.metodo}
          </span>
          {pedido.status === "cancelado" && pedido.razonCancelacion && (
            <span className="text-[12px] bg-[#ffa6a6] text-[#c62828] px-2 py-1 rounded-[6px]">
              {pedido.razonCancelacion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const { slug } = useParams();
  const [orderIds, setOrderIds] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("platillo_orders") || "[]");
    const delRestaurante = todos
      .filter((p) => p.restaurantSlug === slug)
      .reverse(); // más reciente primero
    setOrderIds(delRestaurante);
  }, [slug]);

  return (
    <div className="relative max-w-[420px] mx-auto bg-white min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-6 flex items-center gap-3 sticky top-0 z-10">
        <h1 className="font-bold w-full h-full text-center">Pedidos</h1>
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-9 h-9 cursor-pointer rounded-md bg-[var(--gray-color)] border border-[1.6px] border-[var(--gray-color)]  flex items-center justify-center"
        >
          <svg
            className="w-7"
            xmlns="http://www.w3.org/2000/svg"
            height="48px"
            viewBox="0 -960 960 960"
            width="48px"
            fill="white"
          >
            <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z" />
          </svg>
        </button>
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-3 p-3 pb-[calc(40px+env(safe-area-inset-bottom))]">
        {orderIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[16px] font-semibold text-[#1a1a1a]">
              Sin pedidos
            </p>
            <p className="text-[14px] text-[var(--gray-color)] text-center">
              Aún no tienes pedidos en este restaurante
            </p>
            <Link href={`/${slug}`}>
              <button className="mt-4 bg-[var(--accent-color)] text-white px-6 py-2 rounded-[10px] text-[14px] font-semibold">
                Ver menú
              </button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-[var(--gray-color)] uppercase tracking-wider font-semibold px-1">
              {orderIds.length} {orderIds.length === 1 ? "pedido" : "pedidos"}
            </p>
            {orderIds.map((p) => (
              <PedidoCard key={p.orderId} orderId={p.orderId} />
            ))}
          </>
        )}
      </div>

      <Navbar restaurantOpen={true} slug={slug} />
    </div>
  );
}
