"use client";
import { useState, useEffect } from "react";

const WA = "https://wa.me/521XXXXXXXXXX?text=Hola%2C%20quiero%20una%20demostraci%C3%B3n%20de%20Platillo";
const DEMO = "https://pide.platillo.mx/tunegocio";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    padding: scrolled ? "12px 0" : "20px 0",
    background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
    backdropFilter: scrolled ? "blur(12px)" : "none",
    borderBottom: scrolled ? "1px solid #ededed" : "none",
    transition: "all 0.3s ease",
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 32 }}>
        {/* Logo */}
        <a href="/" style={{ fontFamily: "Onest, sans-serif", fontSize: 20, fontWeight: 800, color: "#000", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, letterSpacing: -0.5, flexShrink: 0 }}>
         Platillo
        </a>

        {/* Links desktop */}
        <div style={{ display: "flex", gap: 28, flex: 1 }} className="nav-links">
          {[["#como-funciona", "Cómo funciona"], ["#beneficios", "Beneficios"], ["#precios", "Precios"], ["#faq", "FAQ"]].map(([href, label]) => (
            <a key={href} href={href} style={{ fontFamily: "Onest, sans-serif", fontSize: 15, color: "#555", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = "#000"}
              onMouseLeave={e => e.target.style.color = "#555"}>
              {label}
            </a>
          ))}
        </div>

        {/* CTAs desktop */}
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }} className="nav-actions">
          <a href={DEMO} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "Onest, sans-serif", fontSize: 14, fontWeight: 600, color: "#000", textDecoration: "none", padding: "8px 16px", border: "1.5px solid #ededed", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.background = "#f8f8f8"; e.target.style.borderColor = "#cbcbcb"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "#ededed"; }}>
            Ver demo
          </a>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "Onest, sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", background: "#ed400b", textDecoration: "none", padding: "9px 18px", borderRadius: 8, transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.target.style.background = "#d13508"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "#ed400b"; e.target.style.transform = "translateY(0)"; }}>
            Solicitar demo
          </a>
        </div>

        {/* Burger */}
        <button onClick={() => setOpen(!open)} className="burger-btn"
          style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4, marginLeft: "auto" }}>
          <span style={{ display: "block", width: 24, height: 2, background: "#000", borderRadius: 2 }} />
          <span style={{ display: "block", width: 24, height: 2, background: "#000", borderRadius: 2 }} />
          <span style={{ display: "block", width: 24, height: 2, background: "#000", borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "#fff", borderTop: "1px solid #ededed", padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[["#como-funciona", "Cómo funciona"], ["#beneficios", "Beneficios"], ["#precios", "Precios"], ["#faq", "FAQ"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              style={{ fontFamily: "Onest, sans-serif", fontSize: 16, color: "#333", textDecoration: "none", fontWeight: 500 }}>
              {label}
            </a>
          ))}
          <a href={DEMO} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "Onest, sans-serif", fontSize: 15, fontWeight: 600, color: "#000", textDecoration: "none", border: "1.5px solid #ededed", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            Ver demo en vivo
          </a>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: "Onest, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", background: "#ed400b", textDecoration: "none", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
            Solicitar demostración
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .nav-links, .nav-actions { display: none !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
