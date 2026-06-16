"use client";

import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { Problema, ComoFunciona, Beneficios } from "./components/Secciones1";
import { ComparacionWA, Comisiones, Analiticas } from "./components/Secciones2";
import { Testimonios, Precios, FAQ, CTAFinal, Footer } from "./components/Secciones3";

export default function PlatilloLanding() {
  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("sr-visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".sr").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Onest', sans-serif; background: #fff; color: #000; -webkit-font-smoothing: antialiased; }

        /* Scroll reveal */
        .sr { opacity: 0; transform: translateY(24px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .sr-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .sr-d1 { transition-delay: 0.1s; }
        .sr-d2 { transition-delay: 0.2s; }
        .sr-d3 { transition-delay: 0.3s; }

        @media (max-width: 500px) {
          section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      <Navbar />
      <main>
        <Hero />
        <Problema />
        <ComoFunciona />
        <Beneficios />
        <ComparacionWA />
        <Comisiones />
        <Analiticas />
        <Testimonios />
        <Precios />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}