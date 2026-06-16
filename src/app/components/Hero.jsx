"use client";
import { useState, useEffect } from "react";

const WA = "https://wa.me/521XXXXXXXXXX?text=Hola%2C%20quiero%20una%20demostraci%C3%B3n%20de%20Platillo";
const DEMO = "https://pide.platillo.mx/tunegocio";

const ORDERS = [
  { item: "Taco de Birria x3", lugar: "Tacos El Padrino", tiempo: "ahora mismo" },
  { item: "Hamburguesa Doble x2", lugar: "Burger Bros", tiempo: "hace 18s" },
  { item: "Pizza Pepperoni x1", lugar: "La Trattoria", tiempo: "hace 42s" },
  { item: "Café Americano x2", lugar: "Café Nocturno", tiempo: "hace 1min" },
  { item: "Orden de Alitas x1", lugar: "Wings House", tiempo: "hace 2min" },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [orderIdx, setOrderIdx] = useState(0);

  useEffect(() => {
    setVisible(true);
    const t = setInterval(() => setOrderIdx(i => (i + 1) % ORDERS.length), 2400);
    return () => clearInterval(t);
  }, []);

  const order = ORDERS[orderIdx];

  return (
    <section style={{ minHeight: "100vh", padding: "130px 24px 80px", background: "#fff", overflow: "hidden" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">

        {/* LEFT */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          {/* Pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff7f5", border: "1px solid #fcd8cc", color: "#ed400b", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 100, marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, background: "#ed400b", borderRadius: "50%", display: "inline-block", animation: "blink 1.6s infinite" }} />
            Sin comisiones por pedido
          </div>

          <h1 style={{ fontSize: "clamp(38px, 5.5vw, 66px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, color: "#000", marginBottom: 24, fontFamily: "Onest, sans-serif" }}>
            Recibe pedidos automáticamente<br />
            sin vivir pegado a<br />
            <span style={{ color: "#ed400b" }}>WhatsApp</span><br /> 
          </h1>
 

          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#555", maxWidth: 480, marginBottom: 28, fontFamily: "Onest, sans-serif" }}>
            Platillo le da a tu restaurante un menú digital con QR, pedidos desde celular, notificaciones automáticas por WhatsApp y cero comisiones por venta.
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
            {["Menú digital", "Código QR", "WhatsApp automático", "Sin comisiones"].map(t => (
              <span key={t} style={{ background: "#f5f5f5", border: "1px solid #e8e8e8", fontSize: 13, fontWeight: 500, color: "#333", padding: "5px 12px", borderRadius: 100, fontFamily: "Onest, sans-serif" }}>{t}</span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
            <a href={WA} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "Onest, sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", background: "#ed400b", textDecoration: "none", padding: "14px 28px", borderRadius: 10, boxShadow: "0 4px 20px rgba(237,64,11,0.3)", display: "inline-block", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "#d13508"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 28px rgba(237,64,11,0.4)"; }}
              onMouseLeave={e => { e.target.style.background = "#ed400b"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(237,64,11,0.3)"; }}>
              Solicitar demostración
            </a>
            <a href={DEMO} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "Onest, sans-serif", fontSize: 15, fontWeight: 600, color: "#000", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#ed400b"}
              onMouseLeave={e => e.target.style.color = "#000"}>
              Ver demo en vivo →
            </a>
          </div>

          <p style={{ fontSize: 13, color: "#929292", fontFamily: "Onest, sans-serif" }}>
            Desde <strong style={{ color: "#333" }}>$350 MXN/mes</strong> · Sin contratos · Cancela cuando quieras
          </p>
        </div>

        {/* RIGHT — Phone mockup */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s", position: "relative", display: "flex", justifyContent: "center" }}>
          {/* Phone shell */}
          <div style={{ width: 280, height: 540, background: "#111", borderRadius: 38, padding: 10, boxShadow: "0 40px 100px rgba(0,0,0,0.2)", position: "relative", flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 30, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* App header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 10px", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #ed400b, #efa886)", borderRadius: 10, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#000", fontFamily: "Onest, sans-serif" }}>El Padrino Tacos</div>
                  <div style={{ fontSize: 10, color: "#929292", fontFamily: "Onest, sans-serif" }}>Menú · Abierto ahora</div>
                </div>
              </div>
              {/* Banner */}
              <div style={{ height: 80, background: "linear-gradient(135deg, #ed400b, #efa886)", flexShrink: 0 }} />
              {/* Items */}
              <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 700, color: "#000", fontFamily: "Onest, sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Más pedidos</div>
              {["Taco de Birria", "Hamburguesa Doble", "Orden de Alitas"].map((name, i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ width: 40, height: 40, background: "#f0f0f0", borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#000", fontFamily: "Onest, sans-serif" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#929292", fontFamily: "Onest, sans-serif" }}>${[89, 129, 149][i]} MXN</div>
                  </div>
                  <div style={{ width: 26, height: 26, background: "#ed400b", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>+</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating: live order */}
          <div style={{ position: "absolute", right: -16, top: 60, background: "#fff", border: "1px solid #ededed", borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10, width: 230, transition: "opacity 0.4s" }} className="hero-float-card">
            <span style={{ width: 10, height: 10, background: "#2e7d32", borderRadius: "50%", flexShrink: 0, animation: "blink 1.4s infinite" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#929292", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Onest, sans-serif" }}>Nuevo pedido</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#000", fontFamily: "Onest, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{order.item}</div>
              <div style={{ fontSize: 11, color: "#929292", fontFamily: "Onest, sans-serif" }}>{order.lugar} · {order.tiempo}</div>
            </div>
            <span style={{ background: "#ceffd2", color: "#2e7d32", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, flexShrink: 0, fontFamily: "Onest, sans-serif" }}>Nuevo</span>
          </div>

          {/* Floating: WA notif */}
          <div style={{ position: "absolute", left: -24, bottom: 110, background: "#fff", border: "1px solid #ededed", borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 10, width: 220 }} className="hero-float-card">
            <span style={{ fontSize: 22, flexShrink: 0 }}>📱</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#000", fontFamily: "Onest, sans-serif" }}>WhatsApp automático</div>
              <div style={{ fontSize: 11, color: "#555", fontFamily: "Onest, sans-serif" }}>Tu pedido está listo 🎉</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands bar */}
      <div style={{ maxWidth: 1160, margin: "64px auto 0", paddingTop: 32, borderTop: "1px solid #ededed", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", color: "#929292", fontSize: 14, fontFamily: "Onest, sans-serif" }}>
        <span>Funciona para</span>
        {["Taquerías", "Hamburgueserías", "Pizzerías", "Cafeterías", "Restaurantes", "Dark kitchens"].map(b => (
          <span key={b} style={{ background: "#f5f5f5", border: "1px solid #e8e8e8", color: "#333", fontSize: 13, fontWeight: 500, padding: "5px 12px", borderRadius: 100, fontFamily: "Onest, sans-serif" }}>{b}</span>
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-float-card { display: none !important; }
        }
      `}</style>
    </section>
  );
}
