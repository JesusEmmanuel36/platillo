"use client";
import { useState } from "react";

const WA =
  "https://wa.me/5212206120228?text=Hola%2C%20quiero%20una%20demostraci%C3%B3n%20de%20Platillo";
const DEMO = "https://pide.platillo.mx/tunegocio";

// Sección: Testimonios
function IconoCheck({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M9 12L10.5 13.5V13.5C10.7761 13.7761 11.2239 13.7761 11.5 13.5V13.5L15 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Testimonios() {
  const testimonios = [
    {
      nombre: "María González",
      negocio: "Tacos El Padrino",
      comentario:
        "Desde que empezamos con Platillo, los pedidos por WhatsApp se redujeron a cero. Mis clientes hacen su pedido solos y yo me concentro en cocinar.",
    },
    {
      nombre: "Carlos Mendoza",
      negocio: "Burger Bros",
      comentario:
        "Antes perdía pedidos en horas pico. Ahora todo llega a la app en orden, con todos los detalles. Es como tener un empleado extra.",
    },
    {
      nombre: "Laura Reyes",
      negocio: "Café Nocturno",
      comentario:
        "El QR en las mesas fue un cambio total. La gente pide desde su celular y yo no tengo que estar al pendiente del WhatsApp.",
    },
  ];

  return (
    <section style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#ed400b",
              marginBottom: 16,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Testimonios
          </span>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 42px)",
              fontWeight: 900,
              letterSpacing: -1.2,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Negocios que ya automatizaron sus pedidos
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="testimonios-grid"
        >
          {testimonios.map((t, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #ededed",
                borderRadius: 16,
                padding: "26px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#fcd8cc";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ededed";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ color: "#ed400b", fontSize: 16, letterSpacing: 2 }}>
                ★★★★★
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "#333",
                  lineHeight: 1.7,
                  flex: 1,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                "{t.comentario}"
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #ed400b, #efa886)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  {t.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#000",
                      fontFamily: "Onest, sans-serif",
                    }}
                  >
                    {t.nombre}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#929292",
                      fontFamily: "Onest, sans-serif",
                    }}
                  >
                    {t.negocio}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/*         <p style={{ fontSize: 12, color: "#cbcbcb", textAlign: "center", marginTop: 28, fontFamily: "Onest, sans-serif" }}>* Platillo está en fase de lanzamiento. Testimonios representativos.</p>
         */}
      </div>
      <style>{`
        @media (max-width: 760px) { .testimonios-grid { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; } }
      `}</style>
    </section>
  );
}

// Sección: Precios
export function Precios() {
  const features = [
    "Pedidos ilimitados",
    "Productos ilimitados",
    "WhatsApp automático",
    "Analíticas completas",
    "Aplicación móvil",
    "Sin comisiones por pedido",
    "Código QR personalizado",
    "Soporte por WhatsApp",
  ];

  return (
    <section id="precios" style={{ padding: "100px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#ed400b",
              marginBottom: 16,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Precio
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 900,
              letterSpacing: -1.5,
              marginBottom: 14,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Precio simple y transparente.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#666",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Sin sorpresas. Sin contratos. Sin comisiones ocultas.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "2px solid #ed400b",
            borderRadius: 24,
            padding: "48px",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 48,
            alignItems: "center",
            boxShadow: "0 16px 56px rgba(237,64,11,0.1)",
            marginBottom: 24,
          }}
          className="precios-card"
        >
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                display: "inline-block",
                background: "#fff7f5",
                border: "1px solid #fcd8cc",
                color: "#ed400b",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: 100,
                width: "fit-content",
                fontFamily: "Onest, sans-serif",
              }}
            >
              Plan único
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#000",
                  marginTop: 10,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                $
              </span>
              <span
                style={{
                  fontSize: 80,
                  fontWeight: 900,
                  color: "#000",
                  letterSpacing: -4,
                  lineHeight: 1,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                350
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#929292",
                  marginTop: 14,
                  lineHeight: 1.4,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                MXN
                <br />
                /mes
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "#666",
                lineHeight: 1.6,
                fontFamily: "Onest, sans-serif",
              }}
            >
              Menos de $12 MXN al día. Sin comisiones sin importar cuánto
              vendas.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "Onest, sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#ed400b",
                  textDecoration: "none",
                  padding: "14px 24px",
                  borderRadius: 10,
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(237,64,11,0.3)",
                  display: "block",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#d13508";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ed400b";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Empezar ahora
              </a>
              <a
                href={DEMO}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "Onest, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#000",
                  textDecoration: "none",
                  padding: "12px 24px",
                  borderRadius: 10,
                  border: "1.5px solid #ededed",
                  textAlign: "center",
                  display: "block",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f8f8f8";
                  e.target.style.borderColor = "#cbcbcb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "#ededed";
                }}
              >
                Ver demo en vivo →
              </a>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#929292",
                textAlign: "center",
                fontFamily: "Onest, sans-serif",
              }}
            >
              Sin contrato · Cancela cuando quieras
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 240,
              background: "#ededed",
              flexShrink: 0,
            }}
            className="precio-divider"
          />

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#929292",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                fontFamily: "Onest, sans-serif",
              }}
            >
              Todo incluido:
            </p>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {features.map((f, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 15,
                    color: "#222",
                    fontWeight: 500,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      background: "#ceffd2",
                      color: "#2e7d32",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    <IconoCheck size={28} color="#2e7d32" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            background: "#fafafa",
            border: "1px solid #ededed",
            borderRadius: 14,
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            fontSize: 16,
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}></span>
          <p
            style={{
              color: "#444",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Con Rappi o Didi, si vendes{" "}
            <strong style={{ color: "#000" }}>$10,000 MXN al mes</strong> pagas
            entre $2,500 y $3,000 en comisiones. Con Platillo pagas{" "}
            <strong style={{ color: "#000" }}>$350 MXN fijos</strong> y te
            quedas con el resto.
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .precios-card { grid-template-columns: 1fr !important; gap: 32px !important; padding: 32px 24px !important; }
          .precio-divider { width: 100% !important; height: 1px !important; }
        }
      `}</style>
    </section>
  );
}

// Sección: FAQ
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #ededed" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "22px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          fontFamily: "Onest, sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: open ? "#ed400b" : "#000",
          textAlign: "left",
          transition: "all 0.2s",
        }}
      >
        <span>{q}</span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "#929292",
            flexShrink: 0,
            width: 24,
            textAlign: "center",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p
          style={{
            padding: "0 24px 22px",
            fontSize: 15,
            color: "#555",
            lineHeight: 1.75,
            fontFamily: "Onest, sans-serif",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "¿Necesito conocimientos técnicos para usar Platillo?",
      a: "No. Nosotros configuramos todo por ti: tu menú, tus categorías, tu QR y tu enlace. En menos de 24 horas estás recibiendo pedidos.",
    },
    {
      q: "¿Mis clientes tienen que descargar una aplicación?",
      a: "No. Tus clientes solo necesitan su navegador. Abren el enlace o escanean el QR y listo. Sin descargas, sin registros, sin fricción.",
    },
    {
      q: "¿Puedo seguir usando WhatsApp con mis clientes?",
      a: "Sí. Platillo no reemplaza tu WhatsApp personal. Elimina la necesidad de tomarlo a mano para cada pedido. Tus clientes reciben actualizaciones automáticas sin que tú mandes nada.",
    },
    {
      q: "¿Cómo recibe mi negocio los pedidos?",
      a: "A través de la app móvil de Platillo. Recibes una notificación en tiempo real con todos los detalles: qué pidieron, cómo lo quieren, a qué hora y cómo pagan.",
    },
    {
      q: "¿Hay comisiones por pedido?",
      a: "No. Pagas $350 MXN fijos al mes y eso es todo. Sin importar cuántos pedidos recibas ni cuánto vendas, tu costo no cambia.",
    },
    {
      q: "¿Cuánto cuesta Platillo?",
      a: "$350 MXN al mes. Incluye pedidos ilimitados, productos ilimitados, WhatsApp automático, analíticas, app móvil y soporte. Sin costos ocultos.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí. No hay contratos ni permanencias. Si decides pausar o cancelar, lo haces sin penalizaciones.",
    },
  ];

  return (
    <section id="faq" style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#ed400b",
              marginBottom: 16,
              fontFamily: "Onest, sans-serif",
            }}
          >
            FAQ
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: -1.5,
              marginBottom: 14,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Preguntas frecuentes
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#666",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Si tienes más dudas, escríbenos por WhatsApp y te respondemos en
            minutos.
          </p>
        </div>
        <div
          style={{
            border: "1px solid #ededed",
            borderRadius: 16,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Sección: CTA Final
export function CTAFinal() {
  return (
    <section style={{ padding: "80px 24px 100px", background: "#fff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            background: "#000",
            borderRadius: 28,
            padding: "72px 64px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradients */}
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, rgba(237,64,11,0.25) 0%, transparent 70%)",
              top: -120,
              right: -80,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(239,168,134,0.15) 0%, transparent 70%)",
              bottom: -80,
              left: -60,
              pointerEvents: "none",
            }}
          />

          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#ed400b",
              marginBottom: 20,
              position: "relative",
              fontFamily: "Onest, sans-serif",
            }}
          >
            Empieza hoy
          </span>
          <h2
            style={{
              fontSize: "clamp(30px, 5vw, 56px)",
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 20,
              position: "relative",
              fontFamily: "Onest, sans-serif",
            }}
          >
            Empieza a recibir pedidos
            <br />
            automáticamente desde hoy.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              maxWidth: 500,
              margin: "0 auto 40px",
              position: "relative",
              fontFamily: "Onest, sans-serif",
            }}
          >
            Sin configuraciones complicadas. Sin contratos. En menos de 24 horas
            tu menú digital está listo para recibir pedidos.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
              position: "relative",
              marginBottom: 32,
            }}
          >
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "Onest, sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
                background: "#ed400b",
                textDecoration: "none",
                padding: "16px 32px",
                borderRadius: 12,
                boxShadow: "0 4px 24px rgba(237,64,11,0.4)",
                display: "inline-block",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#d13508";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 10px 36px rgba(237,64,11,0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#ed400b";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 24px rgba(237,64,11,0.4)";
              }}
            >
              Solicitar demostración por WhatsApp
            </a>
            <a
              href={DEMO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "Onest, sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                padding: "16px 24px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.2)",
                display: "inline-block",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.5)";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
                e.target.style.color = "rgba(255,255,255,0.75)";
              }}
            >
              Ver demo en vivo →
            </a>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              fontFamily: "Onest, sans-serif",
              position: "relative",
            }}
          >
            {[
              "✓ Sin contratos",
              "✓ Soporte incluido",
              "✓ Lista en 24h",
              "✓ Sin comisiones",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .cta-card { padding: 48px 24px !important; }
        }
      `}</style>
    </section>
  );
}

// Footer
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "#fafafa",
        borderTop: "1px solid #ededed",
        padding: "64px 24px 0",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 48,
          flexWrap: "wrap",
          paddingBottom: 48,
        }}
      >
        <div style={{ maxWidth: 260 }}>
          <a
            href="/"
            style={{
              fontFamily: "Onest, sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#000",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: -0.5,
              marginBottom: 14,
            }}
          >
            <img src="/logo.png" className="w-18" alt="" />
            {/*            <span style={{ color: "#ed400b" }}>●</span> Platillo
             */}
          </a>
          <p
            style={{
              fontSize: 14,
              color: "#929292",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Pedidos digitales para restaurantes.
            <br />
            Sin comisiones. Sin complicaciones.
          </p>
        </div>
        <div style={{ display: "flex", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#000",
                marginBottom: 4,
                fontFamily: "Onest, sans-serif",
              }}
            >
              Plataforma
            </p>
            {[
              ["#como-funciona", "Cómo funciona"],
              ["#beneficios", "Beneficios"],
              ["#precios", "Precios"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  color: "#666",
                  textDecoration: "none",
                  fontFamily: "Onest, sans-serif",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#000")}
                onMouseLeave={(e) => (e.target.style.color = "#666")}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#000",
                marginBottom: 4,
                fontFamily: "Onest, sans-serif",
              }}
            >
              Contacto
            </p>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                color: "#666",
                textDecoration: "none",
                fontFamily: "Onest, sans-serif",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#000")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              WhatsApp
            </a>
            <a
              href="mailto:hola@platillo.mx"
              style={{
                fontSize: 14,
                color: "#666",
                textDecoration: "none",
                fontFamily: "Onest, sans-serif",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#000")}
              onMouseLeave={(e) => (e.target.style.color = "#666")}
            >
              hola@platillo.mx
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "20px 0",
          borderTop: "1px solid #ededed",
          fontSize: 13,
          color: "#9f9f9f",
          fontFamily: "Onest, sans-serif",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>© {year} Platillo. Todos los derechos reservados.</span>

        <span>
          Platillo es un servicio operado por JESUS EMMANUEL ESTRADA RODRIGUEZ.
        </span>
      </div>
    </footer>
  );
}
