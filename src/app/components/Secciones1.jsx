// Sección: Problema
export function Problema() {
  const problemas = [
    { emoji: "⏳", title: "Clientes esperando respuesta", desc: "Tu cliente mandó su pedido hace 10 minutos. Tú estás ocupado. El pedido se pierde." },
    { emoji: "📋", title: "Pedidos perdidos entre mensajes", desc: "Entre notas de voz, fotos y texto, un pedido se va sin querer al scroll." },
    { emoji: "🕐", title: "Solo recibes pedidos en tu horario", desc: "Si no estás conectado, no hay pedidos. Tu negocio duerme aunque tus clientes no." },
    { emoji: "❌", title: "Errores al interpretar pedidos", desc: "Sin cebolla lo leíste tarde. El cliente ya llegó y hay que rehacer todo." },
    { emoji: "🔥", title: "Saturación en horas pico", desc: "Viernes por la noche: 30 mensajes en WhatsApp, la cocina esperando, tú sin poder con todo." },
  ];

  return (
    <section style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>El problema real</span>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 50px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 18, fontFamily: "Onest, sans-serif" }}>
            Tu restaurante no debería<br />depender de <span style={{ color: "#ed400b" }}>WhatsApp.</span>
          </h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.7, maxWidth: 560, margin: "0 auto", fontFamily: "Onest, sans-serif" }}>
            WhatsApp fue diseñado para chatear, no para tomar pedidos. Cada mensaje manual que procesas es tiempo, dinero y clientes que se van.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }} className="problema-grid">
          {problemas.map((p, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ededed", borderRadius: 16, padding: "28px 24px", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fcd8cc"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ededed"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{p.emoji}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 8, fontFamily: "Onest, sans-serif" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, fontFamily: "Onest, sans-serif" }}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff7f5", border: "1px solid #fcd8cc", borderRadius: 16, padding: "22px 28px", display: "flex", alignItems: "flex-start", gap: 14 }}>
     
          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.65, fontFamily: "Onest, sans-serif" }}>
            Cada pedido perdido es dinero que sale de tu negocio. Los negocios que automatizan sus pedidos <strong style={{ color: "#000" }}>aumentan sus ventas hasta 40%</strong> sin contratar a nadie más.
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) { .problema-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 500px) { .problema-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// Sección: Cómo funciona
export function ComoFunciona() {
  const pasos = [
    { num: "01", emoji: "", title: "Cliente escanea el QR o abre el enlace", desc: "Pega el QR en tu local, compártelo en Instagram o en tu bio. Se abre desde el celular sin descargar nada." },
    { num: "02", emoji: "", title: "Elige, personaliza y hace su pedido", desc: "Navega el menú, agrega productos, personaliza opciones y confirma en segundos." },
    { num: "03", emoji: "", title: "Tu negocio recibe el pedido al instante", desc: "Notificación en tu app con todos los detalles: qué pidieron, cómo lo quieren y cómo pagan." },
    { num: "04", emoji: "", title: "El cliente recibe actualizaciones por WhatsApp", desc: "Cuando cambias el estado del pedido, tu cliente recibe un WhatsApp automático. Cero llamadas." },
  ];

  return (
    <section id="como-funciona" style={{ padding: "100px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>Cómo funciona</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: -1.5, marginBottom: 14, fontFamily: "Onest, sans-serif" }}>Así funciona Platillo</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, fontFamily: "Onest, sans-serif" }}>De pedido a entrega, todo automatizado. Tu equipo solo cocina.</p>
        </div>

        {pasos.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 44, height: 44, background: "#ed400b", color: "#fff", fontSize: 13, fontWeight: 800, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Onest, sans-serif", flexShrink: 0 }}>{p.num}</div>
              {i < pasos.length - 1 && <div style={{ width: 2, flex: 1, background: "#ededed", margin: "8px 0", minHeight: 32 }} />}
            </div>
            <div style={{ paddingBottom: i < pasos.length - 1 ? 40 : 0 }}>
              <div style={{ fontSize: 24, marginBottom: 10, paddingTop: 8 }}>{p.emoji}</div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: "#000", marginBottom: 8, letterSpacing: -0.3, fontFamily: "Onest, sans-serif" }}>{p.title}</h3>
              <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, fontFamily: "Onest, sans-serif" }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Sección: Beneficios
export function Beneficios() {
  const items = [
    { icon: "🕐", title: "Pedidos 24/7", desc: "Tu menú nunca cierra. Recibe pedidos aunque estés dormido." },
    { icon: "💬", title: "WhatsApp automático", desc: "Tu cliente recibe actualizaciones sin que tú mandes ni un mensaje." },
    { icon: "🚫", title: "Sin comisiones", desc: "Costo fijo mensual. Sin importar cuánto vendas, siempre pagas lo mismo." },
    { icon: "∞", title: "Productos ilimitados", desc: "Sube todo tu menú. Sin límite de categorías ni productos." },
    { icon: "🎛️", title: "Personalización total", desc: "Opciones, extras, variantes. El cliente personaliza su pedido al instante." },
    { icon: "💵", title: "Pago en efectivo", desc: "Acepta pedidos que se pagan en el local o a domicilio." },
    { icon: "💳", title: "Pago con tarjeta", desc: "Conecta tu terminal o activa pagos en línea fácilmente." },
    { icon: "🏦", title: "Pago por transferencia", desc: "El cliente ve tu CLABE o número directo en el checkout." },
    { icon: "📲", title: "App para tu negocio", desc: "Gestiona pedidos, actualiza estados y revisa analíticas desde tu celular." },
  ];

  return (
    <section id="beneficios" style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>Beneficios</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14, fontFamily: "Onest, sans-serif" }}>Todo lo que necesitas.<br />Nada de lo que no.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, maxWidth: 480, margin: "0 auto", fontFamily: "Onest, sans-serif" }}>Platillo está diseñado para negocios de comida reales, no para corporativos con equipos de IT.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="beneficios-grid">
          {items.map((b, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ededed", borderRadius: 16, padding: "26px 22px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#fcd8cc"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ededed"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <span style={{ fontSize: 26, display: "block", marginBottom: 12 }}>{b.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#000", marginBottom: 6, fontFamily: "Onest, sans-serif" }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, fontFamily: "Onest, sans-serif" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .beneficios-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 500px) { .beneficios-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
