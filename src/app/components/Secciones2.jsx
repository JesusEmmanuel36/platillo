// Sección: Comparación vs WhatsApp
export function ComparacionWA() {
  const filas = [
    { feature: "Tomar pedidos manualmente", wa: false, platillo: false, platilloTxt: "Automático" },
    { feature: "Disponibilidad 24/7", wa: false, platillo: true },
    { feature: "Errores humanos en pedidos", wa: true, waTxt: "Frecuentes", platillo: false, platilloTxt: "Eliminados" },
    { feature: "Actualizaciones automáticas al cliente", wa: false, platillo: true },
    { feature: "Menú digital con fotos y precios", wa: false, platillo: true },
    { feature: "Escala sin contratar más personal", wa: false, platillo: true },
  ];

  const Check = () => (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:28, height:28, background:"#ceffd2", color:"#2e7d32", borderRadius:"50%", fontSize:14, fontWeight:700, fontFamily:"Onest,sans-serif" }}>✓</span>
  );
  const Cross = () => (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:28, height:28, background:"#ffa3a3", color:"#d21616", borderRadius:"50%", fontSize:14, fontWeight:700, fontFamily:"Onest,sans-serif" }}>✗</span>
  );

  return (
    <section style={{ padding: "100px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>Comparación</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: -1.5, marginBottom: 14, fontFamily: "Onest, sans-serif" }}>WhatsApp vs. Platillo</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, fontFamily: "Onest, sans-serif" }}>No es culpa de WhatsApp. Es la herramienta equivocada para el trabajo.</p>
        </div>

        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #ededed" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Onest, sans-serif" }}>
            <thead>
              <tr>
                <th style={{ width: "40%", padding: "20px 24px", textAlign: "left", background: "#fafafa", fontSize: 14, fontWeight: 600, color: "#929292" }}></th>
                <th style={{ width: "30%", padding: "20px 24px", textAlign: "center", background: "#fafafa" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                    <span>💬</span> WhatsApp
                  </div>
                </th>
                <th style={{ width: "30%", padding: "20px 24px", textAlign: "center", background: "#fff7f5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                    <span style={{ color: "#ed400b" }}>●</span> Platillo
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} style={{ borderTop: "1px solid #ededed" }}>
                  <td style={{ padding: "16px 24px", fontSize: 15, color: "#333", fontWeight: 500 }}>{f.feature}</td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    {f.wa ? <Check /> : f.waTxt ? <span style={{ fontSize: 13, color: "#929292" }}>{f.waTxt}</span> : <Cross />}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center", background: "#fffaf9" }}>
                    {f.platillo ? <Check /> : f.platilloTxt ? <span style={{ fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>{f.platilloTxt}</span> : <Check />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Sección: Comisiones vs Rappi/Didi
export function Comisiones() {
  return (
    <section style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>Sin comisiones</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14, fontFamily: "Onest, sans-serif" }}>Vende sin perder dinero<br />en cada pedido.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, maxWidth: 520, margin: "0 auto", fontFamily: "Onest, sans-serif" }}>
            Rappi y Didi Food te cobran entre 20% y 35% por cada venta. Con Platillo, pagas una cuota fija y te quedas con todo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "start" }} className="comisiones-grid">
          {/* Rappi */}
          {[
            { icon: "🟠", name: "Rappi", pct: "~30%", ejemplo: "En $1,000 MXN de ventas, pagas ~$300 MXN de comisión." },
            { icon: "🟡", name: "Didi Food", pct: "~25%", ejemplo: "En $1,000 MXN de ventas, pagas ~$250 MXN de comisión." },
          ].map((comp, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ededed", borderRadius: 20, padding: "32px 26px", textAlign: "center", opacity: 0.85 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>{comp.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#333", fontFamily: "Onest, sans-serif" }}>{comp.name}</span>
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#d21616", letterSpacing: -2, lineHeight: 1, marginBottom: 4, fontFamily: "Onest, sans-serif" }}>{comp.pct}</div>
              <p style={{ fontSize: 13, color: "#929292", marginBottom: 20, fontFamily: "Onest, sans-serif" }}>por cada pedido</p>
              <div style={{ background: "rgba(255,163,163,0.15)", border: "1px solid #ffa3a3", borderRadius: 10, padding: 14, fontSize: 14, color: "#555", lineHeight: 1.6, fontFamily: "Onest, sans-serif" }}>
                {comp.ejemplo}
              </div>
            </div>
          ))}

          {/* Platillo */}
          <div style={{ background: "#fff", border: "2px solid #ed400b", borderRadius: 20, padding: "32px 26px", textAlign: "center", position: "relative", boxShadow: "0 12px 40px rgba(237,64,11,0.12)" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#ed400b", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap", fontFamily: "Onest, sans-serif" }}>Recomendado</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ color: "#ed400b", fontSize: 18 }}>●</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#000", fontFamily: "Onest, sans-serif" }}>Platillo</span>
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#000", letterSpacing: -3, lineHeight: 1, marginBottom: 4, fontFamily: "Onest, sans-serif" }}>$350</div>
            <p style={{ fontSize: 13, color: "#929292", marginBottom: 20, fontFamily: "Onest, sans-serif" }}>MXN fijos al mes</p>
            <div style={{ background: "#fff7f5", border: "1px solid #fcd8cc", borderRadius: 10, padding: 14, fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 12, fontFamily: "Onest, sans-serif" }}>
              Sin importar cuánto vendas,<br /><strong style={{ color: "#000" }}>siempre pagas $350 MXN.</strong>
            </div>
            <div style={{ background: "#ceffd2", borderRadius: 10, padding: 14, fontSize: 14, color: "#2e7d32", lineHeight: 1.6, fontFamily: "Onest, sans-serif" }}>
              Si vendes $15,000/mes con Rappi,<br />ahorras hasta <strong style={{ color: "#1b5e20" }}>$4,150 MXN al mes.</strong>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#cbcbcb", textAlign: "center", marginTop: 28, fontFamily: "Onest, sans-serif" }}>* Porcentajes aproximados. Pueden variar según contrato con cada plataforma.</p>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .comisiones-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}

// Sección: Analíticas
export function Analiticas() {
  const barData = [40, 65, 45, 80, 55, 90, 70];
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const maxVal = Math.max(...barData);

  const topProducts = [
    { name: "Taco de Birria", pct: 92, sales: 148 },
    { name: "Hamburguesa Doble", pct: 74, sales: 119 },
    { name: "Orden de Alitas", pct: 61, sales: 98 },
    { name: "Café Americano", pct: 45, sales: 72 },
  ];

  return (
    <section id="analiticas" style={{ padding: "100px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#ed400b", marginBottom: 16, fontFamily: "Onest, sans-serif" }}>Analíticas</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14, fontFamily: "Onest, sans-serif" }}>Conoce tu negocio<br />por dentro.</h2>
          <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, maxWidth: 500, margin: "0 auto", fontFamily: "Onest, sans-serif" }}>Platillo te muestra qué se vende, cuándo y cuánto entra. Toma decisiones con datos reales, no con corazonadas.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 210px", gap: 20 }} className="analiticas-grid">
          {/* Bar chart */}
          <div style={{ background: "#fff", border: "1px solid #ededed", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#929292", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Onest, sans-serif" }}>Ventas esta semana</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#000", letterSpacing: -1, marginTop: 4, fontFamily: "Onest, sans-serif" }}>$8,450 MXN</div>
              </div>
              <span style={{ background: "#ceffd2", color: "#2e7d32", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100, fontFamily: "Onest, sans-serif" }}>↑ 18%</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
              {barData.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", background: i === 5 ? "#ed400b" : "#ededed", borderRadius: "4px 4px 0 0", height: `${(val / maxVal) * 100}%`, minHeight: 4 }} />
                  <span style={{ fontSize: 11, color: "#929292", fontWeight: 500, fontFamily: "Onest, sans-serif" }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "", label: "Pedidos hoy", val: "47" },
              { icon: "", label: "Ingresos del mes", val: "$32,800" },
              { icon: "", label: "Ticket promedio", val: "$186 MXN" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fafafa", border: "1px solid #ededed", borderRadius: 14, padding: "16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "#929292", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "Onest, sans-serif" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#000", letterSpacing: -0.5, fontFamily: "Onest, sans-serif" }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Top products — full row */}
          <div style={{ gridColumn: "1 / -1", background: "#fff", border: "1px solid #ededed", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#929292", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20, fontFamily: "Onest, sans-serif" }}>Productos más vendidos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 24, height: 24, background: "#f5f5f5", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#555", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Onest, sans-serif" }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#000", marginBottom: 6, fontFamily: "Onest, sans-serif" }}>{p.name}</div>
                    <div style={{ height: 6, background: "#ededed", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.pct}%`, background: "#ed400b", borderRadius: 100 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: "#929292", fontWeight: 500, flexShrink: 0, fontFamily: "Onest, sans-serif" }}>{p.sales} uds</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 680px) {
          .analiticas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
