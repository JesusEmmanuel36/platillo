// app/[slug]/pedidos/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const statusConfig = {
  preparando: {
    label: "En preparación",
    bg: "bg-[#ffecce]",
    color: "text-[#ff9d00]",
    dot: "bg-[#ff9d00]",
  },
  listo: {
    label: "Pedido listo",
    bg: "bg-[#ceffd2]",
    color: "text-[#2e7d32]",
    dot: "bg-[#2e7d32]",
  },
  cancelado: {
    label: "Pedido cancelado",
    bg: "bg-[#ffa6a6]",
    color: "text-[#c62828]",
    dot: "bg-[#c62828]",
  },
};

const TERMINADOS = ["listo", "cancelado"];

function PedidoCard({ orderId, onStatusChange }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setPedido(data);
        onStatusChange?.(orderId, data.status);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] shadow-[0_0px_5px_rgba(0,0,0,0.25)] p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="bg-white rounded-[5px] shadow-[0_0px_5px_rgba(0,0,0,0.25)] p-4">
        <p className="text-[14px] text-[var(--gray-color)]">Pedido no encontrado</p>
      </div>
    );
  }

  const cfg = statusConfig[pedido.status] ?? {
    label: pedido.status,
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
    <div className="bg-white rounded-[5px] shadow-[0_0px_5px_rgba(0,0,0,0.25)] flex flex-col p-0 gap-2">
      <div className="p-4 flex flex-col gap-2">
        {/* Status y hora */}
        <div className="flex justify-between items-center">
          <div className={`text-[12px] flex flex-row items-center gap-1 rounded-[10px] px-2 py-[2px] ${cfg.bg} ${cfg.color}`}>
            <div className={`w-2 h-2 rounded-full ${cfg.dot} mr-1`} />
            {cfg.label}
          </div>
          <p className="text-[13px] text-[var(--gray-color)]">{horaFormateada}</p>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-1">
          {pedido.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-start">
              <p className="font-semibold text-[16px]">
                <span>{item.quantity} </span>
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Entrega y total */}
        <div className="flex justify-between items-center text-[14px] text-[var(--gray-color)]">
          <p>{pedido.entrega?.tipo === "local" ? "Recoge en local" : "Envío a domicilio"}</p>
          <p className="text-black text-[16px]">${pedido.total} MXN</p>
        </div>

        {/* Razón cancelación */}
        {pedido.status === "cancelado" && pedido.razonCancelacion && (
          <span className="text-[12px] bg-[#ffa6a6] text-[#c62828] px-2 py-1 rounded-[6px] self-start">
            {pedido.razonCancelacion}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const { slug } = useParams();
  const [orderIds, setOrderIds] = useState([]);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("platillo_orders") || "[]");
    const delRestaurante = todos
      .filter((p) => p.restaurantSlug === slug)
      .reverse();
    setOrderIds(delRestaurante);
  }, [slug]);

  function handleStatusChange(orderId, status) {
    setStatuses((prev) => ({ ...prev, [orderId]: status }));
  }

  const enCurso = orderIds.filter((p) => !TERMINADOS.includes(statuses[p.orderId]));
  const anteriores = orderIds.filter((p) => TERMINADOS.includes(statuses[p.orderId]));

  return (
    <div className="relative max-w-[420px] mx-auto bg-white min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-6 flex items-center gap-3 sticky top-0 z-10">
        <h1 className="font-bold w-full h-full text-center">Pedidos</h1>
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-3 p-3 pb-[calc(100px+env(safe-area-inset-bottom))]">
        {orderIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[16px] font-semibold text-[#1a1a1a]">Sin pedidos</p>
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
            {enCurso.length > 0 && (
              <>
                <p className="text-[11px] text-[var(--gray-color)] uppercase tracking-wider font-semibold px-1">
                  En curso
                </p>
                {enCurso.map((p) => (
                  <PedidoCard
                    key={p.orderId}
                    orderId={p.orderId}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </>
            )}

            {anteriores.length > 0 && (
              <>
                <p className="text-[11px] text-[var(--gray-color)] uppercase tracking-wider font-semibold px-1 mt-2">
                  Anteriores
                </p>
                {anteriores.map((p) => (
                  <PedidoCard
                    key={p.orderId}
                    orderId={p.orderId}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <Navbar restaurantOpen={true} slug={slug} />
    </div>
  );
}