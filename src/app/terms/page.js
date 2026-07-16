import Navbar from "../components/Navbar";
import { Footer } from "../components/Secciones3";

export const metadata = {
  title: "Términos y Condiciones - Platillo",
  description: "Consulta los términos y condiciones de uso de Platillo.",
};

const sections = [
  {
    number: "01",
    title: "Aceptación de los términos",
    paragraphs: [
      "Al acceder o utilizar Platillo aceptas estos Términos y Condiciones. Si no estás de acuerdo con alguno de ellos, deberás abstenerte de utilizar nuestros servicios.",
      "Estos términos aplican a todos los usuarios de la plataforma, incluyendo restaurantes, administradores y clientes que realicen pedidos mediante Platillo.",
    ],
  },
  {
    number: "02",
    title: "Descripción del servicio",
    paragraphs: [
      "Platillo es una plataforma tecnológica que permite a restaurantes crear menús digitales, recibir pedidos, administrar productos, gestionar órdenes e integrar herramientas como WhatsApp Business para mejorar la comunicación con sus clientes.",
      "Platillo actúa únicamente como proveedor de tecnología y no participa directamente en la preparación, venta o entrega de alimentos ofrecidos por los restaurantes.",
    ],
  },
  {
    number: "03",
    title: "Registro y cuentas",
    paragraphs: [
      "Los restaurantes son responsables de proporcionar información verdadera, completa y actualizada durante el registro y de mantener la confidencialidad de sus credenciales de acceso.",
      "Cada usuario es responsable de todas las actividades realizadas desde su cuenta y deberá notificar inmediatamente cualquier acceso no autorizado.",
    ],
  },
  {
    number: "04",
    title: "Responsabilidades del restaurante",
    paragraphs: [
      "Cada restaurante es el único responsable de la información publicada en su menú, incluyendo productos, precios, fotografías, promociones, horarios, disponibilidad y cualquier otra información mostrada a los clientes.",
      "El restaurante también es responsable del cumplimiento de la legislación aplicable relacionada con la venta de alimentos, impuestos, protección al consumidor y cualquier obligación derivada de su actividad comercial.",
    ],
  },
  {
    number: "05",
    title: "Responsabilidades del cliente",
    paragraphs: [
      "Los clientes deberán proporcionar información correcta al realizar un pedido y utilizar la plataforma únicamente con fines legítimos.",
      "Platillo podrá limitar el acceso a usuarios que hagan un uso indebido del servicio, proporcionen información falsa o afecten el funcionamiento normal de la plataforma.",
    ],
  },
  {
    number: "06",
    title: "Pagos y suscripciones",
    paragraphs: [
      "Algunas funciones de Platillo pueden requerir el pago de una suscripción o de servicios adicionales. Los precios y condiciones serán informados previamente antes de su contratación.",
      "Cuando se habiliten pagos en línea, estos podrán ser procesados por proveedores externos especializados en procesamiento de pagos.",
    ],
  },
  {
    number: "07",
    title: "Disponibilidad del servicio",
    paragraphs: [
      "Trabajamos para mantener Platillo disponible de forma continua; sin embargo, no garantizamos que el servicio esté libre de interrupciones ocasionadas por mantenimiento, fallas técnicas o eventos fuera de nuestro control.",
      "Nos reservamos el derecho de modificar, actualizar o mejorar la plataforma cuando sea necesario para garantizar su correcto funcionamiento.",
    ],
  },
  {
    number: "08",
    title: "Propiedad intelectual",
    paragraphs: [
      "Todo el contenido relacionado con Platillo, incluyendo software, diseño, logotipos, gráficos, textos y demás elementos desarrollados por nosotros, está protegido por las leyes de propiedad intelectual aplicables.",
      "Los restaurantes conservan la propiedad sobre el contenido que suban a la plataforma, incluyendo fotografías, productos, logotipos y demás información de su negocio.",
    ],
  },
  {
    number: "09",
    title: "Limitación de responsabilidad",
    paragraphs: [
      "Platillo proporciona únicamente la infraestructura tecnológica necesaria para facilitar la gestión de pedidos. No somos responsables de la calidad de los productos, tiempos de entrega, cancelaciones, incumplimientos o cualquier situación derivada de la operación del restaurante.",
      "En ningún caso Platillo será responsable por daños indirectos, pérdida de ingresos, pérdida de datos o interrupciones comerciales ocasionadas por el uso de la plataforma, salvo cuando así lo exija la legislación aplicable.",
    ],
  },
  {
    number: "10",
    title: "Suspensión o cancelación",
    paragraphs: [
      "Nos reservamos el derecho de suspender o cancelar cuentas que incumplan estos términos, utilicen la plataforma para actividades ilegales o afecten la seguridad, estabilidad o funcionamiento del servicio.",
      "Asimismo, cualquier usuario podrá dejar de utilizar Platillo en cualquier momento, sujeto a las obligaciones pendientes que pudieran existir.",
    ],
  },
  {
    number: "11",
    title: "Modificaciones a estos términos",
    paragraphs: [
      "Podremos actualizar estos Términos y Condiciones cuando sea necesario para reflejar cambios en nuestros servicios o en la legislación aplicable.",
      "La fecha de la última actualización aparecerá al inicio de este documento. El uso continuo de Platillo después de una modificación implica la aceptación de la versión vigente.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #fff;
          color: #000;
          font-family: "Onest", sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .privacy-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 56px;
          align-items: start;
        }

        .privacy-sidebar {
          position: sticky;
          top: 110px;
        }

        .privacy-card {
          transition:
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .privacy-card:hover {
          border-color: #fcd8cc !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.04);
        }

        .privacy-nav-link:hover {
          color: #ed400b !important;
        }

        @media (max-width: 820px) {
          .privacy-layout {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .privacy-sidebar {
            position: static;
          }

          .privacy-sidebar-list {
            display: flex !important;
            overflow-x: auto;
            gap: 8px !important;
            padding-bottom: 8px;
          }

          .privacy-nav-link {
            white-space: nowrap;
            border: 1px solid #ededed;
            border-radius: 100px;
            padding: 8px 12px !important;
          }
        }

        @media (max-width: 560px) {
          .privacy-hero {
            padding: 72px 16px 58px !important;
          }

          .privacy-content {
            padding: 64px 16px 80px !important;
          }

          .privacy-card {
            padding: 24px 20px !important;
          }
        }
      `}</style>

      <Navbar />

      <main>
        {/* Hero */}
        <section
          className="privacy-hero"
          style={{
            padding: "110px 24px 84px",
            background: "linear-gradient(180deg, #fff7f5 0%, #ffffff 100%)",
            borderBottom: "1px solid #f4f4f4",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(237,64,11,0.12) 0%, transparent 68%)",
              top: -220,
              right: -100,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              textAlign: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#ed400b",
                marginBottom: 18,
              }}
            >
              Legal y condiciones
            </span>

            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                margin: "0 0 16px",
              }}
            >
              Términos y Condiciones
            </h1>

            <p
              style={{
                maxWidth: 620,
                margin: "0 auto",
                color: "#666",
                fontSize: 17,
                lineHeight: 1.75,
              }}
            >
              Estos términos regulan el uso de Platillo y de los servicios
              ofrecidos a restaurantes y clientes.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 26,
                padding: "8px 14px",
                borderRadius: 100,
                background: "#fff",
                border: "1px solid #ededed",
                color: "#929292",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ed400b",
                }}
              />
              Última actualización: 15 de julio de 2026
            </div>
          </div>
        </section>

        {/* Contenido */}
        <section
          className="privacy-content"
          style={{
            padding: "88px 24px 110px",
            background: "#fff",
          }}
        >
          <div
            className="privacy-layout"
            style={{
              maxWidth: 1000,
              margin: "0 auto",
            }}
          >
            {/* Índice */}
            <aside className="privacy-sidebar">
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#000",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "0 0 16px",
                }}
              >
                Contenido
              </p>

              <nav
                className="privacy-sidebar-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {sections.map((section) => (
                  <a
                    key={section.number}
                    className="privacy-nav-link"
                    href={`#section-${section.number}`}
                    style={{
                      color: "#929292",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      padding: "7px 0",
                      transition: "color 0.2s",
                    }}
                  >
                    {section.number}. {section.title}
                  </a>
                ))}
              </nav>

              <div
                style={{
                  marginTop: 28,
                  background: "#fff7f5",
                  border: "1px solid #fcd8cc",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ed400b",
                  }}
                >
                  ¿Tienes preguntas?
                </p>

                <a
                  href="mailto:hola@platillo.mx"
                  style={{
                    fontSize: 13,
                    color: "#333",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  hola@platillo.mx
                </a>
              </div>
            </aside>

            {/* Secciones */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                minWidth: 0,
              }}
            >
              {sections.map((section) => (
                <article
                  id={`section-${section.number}`}
                  key={section.number}
                  className="privacy-card"
                  style={{
                    background: "#fff",
                    border: "1px solid #ededed",
                    borderRadius: 18,
                    padding: "32px 34px",
                    scrollMarginTop: 120,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 18,
                    }}
                  >
                    <span
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: 12,
                        background: "#fff7f5",
                        border: "1px solid #fcd8cc",
                        color: "#ed400b",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {section.number}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <h2
                        style={{
                          margin: "2px 0 16px",
                          color: "#000",
                          fontSize: "clamp(21px, 3vw, 27px)",
                          fontWeight: 800,
                          letterSpacing: "-0.7px",
                        }}
                      >
                        {section.title}
                      </h2>

                      {section.paragraphs.map((paragraph, index) => (
                        <p
                          key={index}
                          style={{
                            margin:
                              index === section.paragraphs.length - 1
                                ? 0
                                : "0 0 14px",
                            color: "#666",
                            fontSize: 15,
                            lineHeight: 1.8,
                          }}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}

              <div
                style={{
                  marginTop: 12,
                  background: "#000",
                  borderRadius: 20,
                  padding: "34px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(237,64,11,0.38) 0%, transparent 70%)",
                    right: -70,
                    top: -100,
                  }}
                />

                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      display: "block",
                      color: "#ed400b",
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      marginBottom: 10,
                    }}
                  >
                    ¿Necesitas ayuda?
                  </span>

                  <h2
                    style={{
                      margin: "0 0 10px",
                      color: "#fff",
                      fontSize: 25,
                      fontWeight: 800,
                      letterSpacing: "-0.6px",
                    }}
                  >
                    ¿Tienes dudas sobre estos términos?
                  </h2>

                  <p
                    style={{
                      margin: "0 0 20px",
                      color: "rgba(255,255,255,0.62)",
                      fontSize: 15,
                      lineHeight: 1.7,
                      maxWidth: 520,
                    }}
                  >
                    Si tienes preguntas sobre el uso de Platillo o necesitas
                    información adicional acerca de estos Términos y
                    Condiciones, puedes comunicarte con nosotros.
                  </p>

                  <a
                    href="mailto:hola@platillo.mx"
                    style={{
                      display: "inline-block",
                      background: "#ed400b",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "12px 18px",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    Contactar a Platillo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
