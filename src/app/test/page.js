
"use client"
import { Onest } from "next/font/google";
import Link from "next/link";

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const WHATSAPP_URL =
  "https://wa.me/528134164810?text=Hola%2C%20quiero%20una%20demostraci%C3%B3n%20de%20Platillo%20para%20mi%20restaurante";

const DEMO_URL = "https://pide.platillo.mx/tunegocio";

export default function Home() {
  return (
    <main className={onest.className}>
      <nav className="nav">
        <div className="logo">Platillo</div>
        <div className="navActions">
          <Link href={DEMO_URL} className="navLink">
            Ver demo
          </Link>
          <Link href={WHATSAPP_URL} className="navBtn">
            Solicitar demo
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="heroText reveal">
          <div className="badge">Pedidos online para restaurantes</div>
          <h1>Recibe pedidos automáticamente sin vivir pegado a WhatsApp.</h1>
          <p>
            Platillo convierte tu menú en una experiencia digital: tus clientes
            piden desde su celular, escanean QR, pagan como prefieran y tú
            recibes todo en tiempo real sin pagar comisiones por pedido.
          </p>

          <div className="heroActions">
            <Link href={WHATSAPP_URL} className="primaryBtn">
              Solicitar demostración
            </Link>
            <Link href={DEMO_URL} className="secondaryBtn">
              Ver cómo funciona
            </Link>
          </div>

          <div className="heroProof">
            <span>✓ Menú digital</span>
            <span>✓ QR</span>
            <span>✓ WhatsApp automático</span>
            <span>✓ Sin comisiones</span>
          </div>
        </div>

        <div className="videoCard reveal">
          <div className="videoTop">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="phoneMockup">
            <div className="phoneHeader">
              <div>
                <strong>Hamburguesita Mi Amor</strong>
                <small>Abierto · Pedido en línea</small>
              </div>
              <div className="qr">QR</div>
            </div>

            <div className="product">
              <div className="productImg">🍔</div>
              <div>
                <strong>Hamburguesa clásica</strong>
                <small>Tamaño, ingredientes y extras</small>
              </div>
              <b>$89</b>
            </div>

            <div className="options">
              <span>Suprema +$98</span>
              <span>Sin tomate</span>
              <span>Papas medianas +$15</span>
            </div>

            <div className="checkout">
              <div>
                <small>Total</small>
                <strong>$202 MXN</strong>
              </div>
              <button>Enviar pedido</button>
            </div>
          </div>

          <div className="orderNotification">
            <strong>Nuevo pedido recibido</strong>
            <small>Cliente: Jesús · Pago: transferencia</small>
          </div>

          <div className="whatsappBubble">
            WhatsApp enviado: “Tu pedido está listo”
          </div>
        </div>
      </section>

      <section className="section problem">
        <div className="sectionTitle reveal">
          <span>El problema</span>
          <h2>Tu restaurante no debería depender de WhatsApp.</h2>
          <p>
            WhatsApp sirve para hablar. No para organizar pedidos, productos,
            pagos, horarios y actualizaciones al cliente.
          </p>
        </div>

        <div className="problemGrid">
          {[
            "Clientes esperando respuesta",
            "Pedidos perdidos entre mensajes",
            "Errores al tomar productos",
            "Horarios limitados",
            "Saturación en horas pico",
            "Cero control de ventas",
          ].map((item) => (
            <div className="problemCard reveal" key={item}>
              <div className="xIcon">×</div>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionTitle reveal">
          <span>La solución</span>
          <h2>Así funciona Platillo</h2>
        </div>

        <div className="steps">
          {[
            ["1", "Cliente escanea QR o entra al enlace"],
            ["2", "Hace su pedido desde su celular"],
            ["3", "Tu negocio recibe el pedido al instante"],
            ["4", "El cliente recibe actualizaciones por WhatsApp"],
          ].map(([num, text]) => (
            <div className="step reveal" key={num}>
              <div>{num}</div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionTitle reveal">
          <span>Beneficios</span>
          <h2>Todo lo que necesitas para vender mejor.</h2>
        </div>

        <div className="benefits">
          {[
            ["🕒", "Pedidos 24/7"],
            ["💬", "WhatsApp automático"],
            ["💸", "Sin comisiones por pedido"],
            ["🍕", "Productos ilimitados"],
            ["⚙️", "Personalización de productos"],
            ["💵", "Pagos en efectivo"],
            ["💳", "Pagos con tarjeta"],
            ["🏦", "Pagos por transferencia"],
            ["📱", "App para administrar pedidos"],
          ].map(([icon, title]) => (
            <div className="benefitCard reveal" key={title}>
              <span>{icon}</span>
              <strong>{title}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section compareSection">
        <div className="sectionTitle reveal">
          <span>Comparación</span>
          <h2>WhatsApp tradicional vs Platillo</h2>
        </div>

        <div className="table reveal">
          {[
            ["Tomar pedidos", "Manual", "Automático"],
            ["Disponibilidad 24/7", "Limitada", "Siempre activo"],
            ["Errores humanos", "Frecuentes", "Reducidos"],
            ["Actualizaciones", "Mensaje manual", "WhatsApp automático"],
            ["Menú digital", "No estructurado", "Ordenado y vendible"],
            ["Escalabilidad", "Difícil", "Lista para crecer"],
          ].map(([label, w, p]) => (
            <div className="row" key={label}>
              <strong>{label}</strong>
              <span className="bad">{w}</span>
              <span className="good">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section commission">
        <div className="commissionText reveal">
          <span>Sin comisiones</span>
          <h2>Vende sin pagar comisiones por cada pedido.</h2>
          <p>
            Rappi y Didi pueden quitarte margen en cada venta. Platillo funciona
            con costo fijo mensual para que vender más no te castigue.
          </p>
        </div>

        <div className="commissionCards">
          <div className="commissionCard reveal">
            <strong>Rappi</strong>
            <p>Comisión por pedido</p>
          </div>
          <div className="commissionCard reveal">
            <strong>Didi Food</strong>
            <p>Comisión por pedido</p>
          </div>
          <div className="commissionCard active reveal">
            <strong>Platillo</strong>
            <p>Costo fijo mensual</p>
          </div>
        </div>
      </section>

      <section className="section analytics">
        <div className="sectionTitle reveal">
          <span>Analíticas</span>
          <h2>Control completo de tu restaurante.</h2>
          <p>
            Consulta ventas, productos más vendidos, cortes de caja e ingresos
            desde una vista clara para tomar mejores decisiones.
          </p>
        </div>

        <div className="dashboard reveal">
          <div className="metric big">
            <small>Ventas últimos 30 días</small>
            <strong>$48,250</strong>
          </div>
          <div className="metric">
            <small>Últimos 7 días</small>
            <strong>$12,840</strong>
          </div>
          <div className="metric">
            <small>Pedidos</small>
            <strong>326</strong>
          </div>
          <div className="chart">
            <div style={{ height: "35%" }}></div>
            <div style={{ height: "55%" }}></div>
            <div style={{ height: "45%" }}></div>
            <div style={{ height: "75%" }}></div>
            <div style={{ height: "62%" }}></div>
            <div style={{ height: "90%" }}></div>
          </div>
          <div className="topProduct">
            <small>Producto más vendido</small>
            <strong>Hamburguesa clásica</strong>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="sectionTitle reveal">
          <span>Prueba social</span>
          <h2>Restaurantes que pronto venderán mejor con Platillo.</h2>
        </div>

        <div className="testimonialGrid">
          {[1, 2, 3].map((i) => (
            <div className="testimonial reveal" key={i}>
              <div className="avatar"></div>
              <p>
                “Espacio preparado para testimonio real del restaurante cuando
                Platillo empiece a operar con clientes.”
              </p>
              <strong>Nombre del dueño</strong>
              <small>Restaurante</small>
            </div>
          ))}
        </div>
      </section>

      <section className="section faq">
        <div className="sectionTitle reveal">
          <span>FAQ</span>
          <h2>Preguntas comunes antes de contratar.</h2>
        </div>

        <div className="faqGrid">
          {[
            [
              "¿Necesito conocimientos técnicos?",
              "No. Platillo está pensado para que el restaurante pueda operar pedidos sin complicarse.",
            ],
            [
              "¿Mis clientes deben descargar una app?",
              "No. Tus clientes entran desde un enlace o QR y piden desde el navegador de su celular.",
            ],
            [
              "¿Puedo seguir usando WhatsApp?",
              "Sí. Platillo no reemplaza tu WhatsApp, lo automatiza para confirmaciones y actualizaciones.",
            ],
            [
              "¿Cómo recibo los pedidos?",
              "Desde una aplicación donde puedes ver pedidos en tiempo real y cambiar su estado.",
            ],
            [
              "¿Hay comisiones por pedido?",
              "No. Platillo cobra una suscripción mensual fija.",
            ],
            [
              "¿Cuánto cuesta?",
              "$350 MXN al mes por restaurante.",
            ],
            [
              "¿Puedo cancelar cuando quiera?",
              "Sí. Sin contratos largos ni letras chiquitas.",
            ],
          ].map(([q, a]) => (
            <details className="faqItem reveal" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section pricing">
        <div className="priceCard reveal">
          <span>Precio simple y transparente</span>
          <h2>$350 MXN / mes</h2>
          <p>Todo lo necesario para empezar a recibir pedidos online.</p>

          <ul>
            <li>✓ Pedidos ilimitados</li>
            <li>✓ Productos ilimitados</li>
            <li>✓ WhatsApp automático</li>
            <li>✓ Analíticas</li>
            <li>✓ Aplicación móvil</li>
            <li>✓ Sin comisiones</li>
          </ul>

          <Link href={WHATSAPP_URL} className="primaryBtn full">
            Solicitar demostración
          </Link>
        </div>
      </section>

      <section className="finalCta reveal">
        <h2>Empieza a recibir pedidos automáticamente desde hoy.</h2>
        <p>
          Dale a tus clientes una forma más rápida de pedir y a tu restaurante
          una forma más ordenada de vender.
        </p>
        <Link href={WHATSAPP_URL} className="giantBtn">
          Solicitar demostración por WhatsApp
        </Link>
      </section>

      <footer>
        <strong>Platillo</strong>
        <div>
          <Link href={WHATSAPP_URL}>WhatsApp</Link>
          <a href="mailto:contacto@platillo.mx">contacto@platillo.mx</a>
        </div>
        <small>© 2026 Platillo. Todos los derechos reservados.</small>
      </footer>

      <style jsx>{`
        :root {
          --background: #ffffff;
          --foreground: #000000;
          --light-gray: #ededed;
          --green-color: #ceffd2;
          --green-text-color: #2e7d32;
          --red-color: #ffa3a3;
          --red-text-color: #d21616;
          --gray-color: #929292;
          --half-gray: #cbcbcb;
          --accent-color: #ed400b;
          --light-accent: #efa886;
        }

        * {
          box-sizing: border-box;
        }

        main {
          background: #fff;
          color: #000;
          overflow: hidden;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        .nav {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          height: 84px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .navLink {
          color: #666;
          font-weight: 600;
        }

        .navBtn,
        .primaryBtn,
        .giantBtn {
          background: #ed400b;
          color: white;
          border-radius: 999px;
          font-weight: 800;
          box-shadow: 0 18px 40px rgba(237, 64, 11, 0.22);
          transition: 0.25s ease;
        }

        .navBtn {
          padding: 12px 18px;
        }

        .primaryBtn {
          padding: 16px 24px;
        }

        .navBtn:hover,
        .primaryBtn:hover,
        .giantBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 60px rgba(237, 64, 11, 0.3);
        }

        .secondaryBtn {
          padding: 16px 24px;
          border-radius: 999px;
          border: 1px solid #ddd;
          font-weight: 800;
          background: white;
        }

        .hero {
          width: min(1180px, calc(100% - 32px));
          margin: 40px auto 0;
          min-height: 720px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 48px;
        }

        .badge,
        .sectionTitle span,
        .commissionText span,
        .priceCard span {
          display: inline-flex;
          width: fit-content;
          background: #ceffd2;
          color: #2e7d32;
          padding: 9px 14px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 14px;
        }

        h1 {
          font-size: clamp(48px, 7vw, 82px);
          line-height: 0.92;
          letter-spacing: -0.075em;
          margin: 22px 0;
        }

        .heroText p,
        .sectionTitle p,
        .commissionText p,
        .finalCta p,
        .priceCard p {
          font-size: 19px;
          line-height: 1.65;
          color: #555;
          max-width: 640px;
        }

        .heroActions {
          display: flex;
          gap: 14px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .heroProof {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
          color: #555;
          font-weight: 700;
        }

        .videoCard {
          position: relative;
          border: 1px solid #ededed;
          border-radius: 36px;
          padding: 22px;
          min-height: 600px;
          background:
            radial-gradient(circle at top right, #efa886 0, transparent 35%),
            linear-gradient(180deg, #fff, #f8f8f8);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.1);
        }

        .videoTop {
          display: flex;
          gap: 8px;
          margin-bottom: 28px;
        }

        .videoTop span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
        }

        .phoneMockup {
          width: min(360px, 100%);
          margin: 0 auto;
          background: white;
          border-radius: 34px;
          padding: 22px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.15);
        }

        .phoneHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }

        small {
          display: block;
          color: #777;
          margin-top: 4px;
        }

        .qr {
          background: #000;
          color: white;
          border-radius: 12px;
          padding: 12px;
          font-weight: 800;
        }

        .product {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 14px;
          border: 1px solid #ededed;
          border-radius: 22px;
        }

        .productImg {
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #ededed;
          font-size: 26px;
        }

        .options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0;
        }

        .options span {
          background: #f3f3f3;
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .checkout {
          background: #000;
          color: white;
          border-radius: 24px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkout button {
          border: none;
          background: #ed400b;
          color: white;
          border-radius: 999px;
          padding: 12px 16px;
          font-weight: 800;
        }

        .orderNotification,
        .whatsappBubble {
          position: absolute;
          left: 28px;
          right: 28px;
          background: white;
          border: 1px solid #ededed;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        }

        .orderNotification {
          bottom: 92px;
        }

        .whatsappBubble {
          bottom: 24px;
          color: #2e7d32;
          font-weight: 800;
          background: #ceffd2;
        }

        .section {
          width: min(1180px, calc(100% - 32px));
          margin: 130px auto;
        }

        .sectionTitle {
          text-align: center;
          display: grid;
          place-items: center;
          margin-bottom: 54px;
        }

        h2 {
          font-size: clamp(36px, 5vw, 64px);
          line-height: 1;
          letter-spacing: -0.06em;
          margin: 18px 0;
        }

        .problemGrid,
        .benefits,
        .testimonialGrid,
        .faqGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .problemCard,
        .benefitCard,
        .testimonial,
        .faqItem,
        .commissionCard,
        .metric,
        .topProduct {
          border: 1px solid #ededed;
          background: white;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.04);
        }

        .xIcon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: #ffa3a3;
          color: #d21616;
          border-radius: 50%;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .step {
          background: #fafafa;
          border: 1px solid #ededed;
          border-radius: 30px;
          padding: 26px;
        }

        .step div {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ed400b;
          color: white;
          font-weight: 800;
          margin-bottom: 28px;
        }

        .step p {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.35;
        }

        .benefitCard span {
          font-size: 30px;
          display: block;
          margin-bottom: 18px;
        }

        .benefitCard strong {
          font-size: 19px;
        }

        .table {
          border: 1px solid #ededed;
          border-radius: 34px;
          overflow: hidden;
          background: white;
        }

        .row {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          padding: 22px;
          border-bottom: 1px solid #ededed;
          gap: 18px;
          align-items: center;
        }

        .row:last-child {
          border-bottom: none;
        }

        .bad,
        .good {
          border-radius: 999px;
          padding: 10px 14px;
          width: fit-content;
          font-weight: 800;
        }

        .bad {
          background: #ffa3a3;
          color: #d21616;
        }

        .good {
          background: #ceffd2;
          color: #2e7d32;
        }

        .commission {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 32px;
          align-items: center;
        }

        .commissionCards {
          display: grid;
          gap: 16px;
        }

        .commissionCard.active {
          background: #000;
          color: white;
          transform: scale(1.03);
        }

        .commissionCard.active p {
          color: #ceffd2;
        }

        .dashboard {
          border: 1px solid #ededed;
          border-radius: 38px;
          padding: 24px;
          background: #fafafa;
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 18px;
        }

        .metric.big {
          grid-row: span 2;
          background: #000;
          color: white;
        }

        .metric strong {
          font-size: 34px;
          letter-spacing: -0.04em;
          margin-top: 16px;
          display: block;
        }

        .chart {
          grid-column: span 2;
          min-height: 220px;
          background: white;
          border-radius: 28px;
          border: 1px solid #ededed;
          padding: 24px;
          display: flex;
          gap: 14px;
          align-items: end;
        }

        .chart div {
          flex: 1;
          background: #ed400b;
          border-radius: 999px 999px 10px 10px;
        }

        .topProduct {
          grid-column: span 3;
        }

        .avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ededed;
          margin-bottom: 18px;
        }

        .testimonial p {
          color: #555;
          line-height: 1.55;
        }

        .faqItem {
          cursor: pointer;
        }

        .faqItem summary {
          font-weight: 800;
          list-style: none;
        }

        .faqItem summary::-webkit-details-marker {
          display: none;
        }

        .faqItem p {
          color: #555;
          line-height: 1.55;
        }

        .pricing {
          display: grid;
          place-items: center;
        }

        .priceCard {
          width: min(560px, 100%);
          border: 1px solid #ededed;
          border-radius: 40px;
          padding: 40px;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.08);
        }

        .priceCard h2 {
          color: #ed400b;
        }

        .priceCard ul {
          list-style: none;
          padding: 0;
          margin: 28px 0;
          display: grid;
          gap: 14px;
          font-weight: 800;
        }

        .full {
          display: block;
          text-align: center;
        }

        .finalCta {
          width: min(1180px, calc(100% - 32px));
          margin: 100px auto;
          background:
            radial-gradient(circle at top right, rgba(237, 64, 11, 0.4), transparent 32%),
            #000;
          color: white;
          text-align: center;
          border-radius: 44px;
          padding: 72px 24px;
        }

        .finalCta p {
          margin: 0 auto 34px;
          color: #cbcbcb;
        }

        .giantBtn {
          display: inline-flex;
          padding: 20px 32px;
          font-size: 18px;
        }

        footer {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 48px 0;
          border-top: 1px solid #ededed;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          color: #666;
        }

        footer strong {
          color: #000;
          font-size: 22px;
        }

        footer div {
          display: flex;
          gap: 18px;
        }

        .reveal {
          animation: reveal 0.8s ease both;
          animation-timeline: view();
          animation-range: entry 0% cover 30%;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .hero,
          .commission {
            grid-template-columns: 1fr;
          }

          .hero {
            min-height: auto;
            margin-top: 20px;
          }

          .problemGrid,
          .benefits,
          .testimonialGrid,
          .faqGrid,
          .steps {
            grid-template-columns: 1fr;
          }

          .dashboard {
            grid-template-columns: 1fr;
          }

          .chart,
          .topProduct {
            grid-column: span 1;
          }

          .metric.big {
            grid-row: span 1;
          }

          .row {
            grid-template-columns: 1fr;
          }

          .navLink {
            display: none;
          }

          h1 {
            font-size: 48px;
          }

          .videoCard {
            min-height: 560px;
          }
        }
      `}</style>
    </main>
  );
}