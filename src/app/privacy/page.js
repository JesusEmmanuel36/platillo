import Navbar from "../components/Navbar";
import { Footer } from "../components/Secciones3";

export const metadata = {
  title: "Política de privacidad - Platillo",
  description:
    "Consulta la política de privacidad y el tratamiento de datos de Platillo.",
};

const sections = [
  {
    number: "01",
    title: "Introducción",
    paragraphs: [
      "En Platillo respetamos la privacidad de nuestros usuarios y nos comprometemos a proteger la información personal que recopilamos. Esta Política de Privacidad explica qué información obtenemos, cómo la utilizamos, cómo la protegemos y los derechos que tienen nuestros usuarios al utilizar nuestra plataforma.",
      "Al utilizar Platillo aceptas las prácticas descritas en esta política. Si no estás de acuerdo con alguno de estos términos, te recomendamos no utilizar nuestros servicios.",
    ],
  },
  {
    number: "02",
    title: "Quiénes somos",
    paragraphs: [
      "Platillo es una plataforma tecnológica diseñada para ayudar a restaurantes a recibir pedidos digitales, administrar su menú, gestionar pedidos e integrar herramientas como WhatsApp Business para mejorar la comunicación con sus clientes.",
      "Nuestro sitio web oficial es https://platillo.mx y cualquier consulta relacionada con privacidad puede realizarse escribiendo a hola@platillo.mx.",
    ],
  },
  {
    number: "03",
    title: "Información que recopilamos",
    paragraphs: [
      "Dependiendo del uso que hagas de Platillo, podemos recopilar información como nombre del restaurante, datos de contacto, dirección, horarios, productos, fotografías, precios y demás información necesaria para operar la plataforma.",
      "Cuando un cliente realiza un pedido podremos recopilar datos como nombre, número telefónico, dirección de entrega cuando aplique, productos solicitados, comentarios del pedido, método de pago seleccionado e historial de pedidos.",
      "También podemos recopilar información técnica como dirección IP, navegador, sistema operativo, tipo de dispositivo y registros de uso con el objetivo de mejorar el funcionamiento y la seguridad de nuestros servicios.",
    ],
  },
  {
    number: "04",
    title: "Cómo utilizamos la información",
    paragraphs: [
      "Utilizamos la información recopilada para procesar pedidos, mostrar el menú del restaurante, enviar notificaciones, responder consultas, administrar cuentas, mejorar la experiencia de uso y mantener la seguridad de la plataforma.",
      "La información también puede utilizarse para detectar errores, prevenir actividades fraudulentas, generar estadísticas internas y cumplir obligaciones legales cuando sea necesario.",
    ],
  },
  {
    number: "05",
    title: "Integraciones y servicios de terceros",
    paragraphs: [
      "Platillo utiliza proveedores tecnológicos de confianza para ofrecer sus servicios. Dependiendo de las funciones utilizadas por cada restaurante, la información puede ser procesada mediante servicios como Firebase, Cloud Firestore, Firebase Authentication, Cloudinary, Google Cloud, Meta (WhatsApp Business Platform), Google Maps y Stripe cuando los pagos en línea estén disponibles.",
      "Cada uno de estos proveedores cuenta con sus propias políticas de privacidad y medidas de seguridad para proteger la información procesada.",
    ],
  },
  {
    number: "06",
    title: "WhatsApp Business",
    paragraphs: [
      "Cuando un restaurante decide conectar su cuenta de WhatsApp Business con Platillo, utilizamos la API oficial de Meta para enviar y recibir mensajes relacionados con la operación del restaurante.",
      "Platillo únicamente almacena la información técnica necesaria para mantener la integración, como identificadores de la cuenta de WhatsApp Business y del número conectado. No utilizizamos el contenido de las conversaciones con fines publicitarios.",
    ],
  },
  {
    number: "07",
    title: "Seguridad de la información",
    paragraphs: [
      "Implementamos medidas razonables de seguridad para proteger la información contra accesos no autorizados, alteraciones, pérdidas o divulgaciones indebidas. Esto incluye controles de acceso, autenticación y almacenamiento seguro de la información.",
      "Sin embargo, ningún sistema conectado a Internet puede garantizar una seguridad absoluta, por lo que recomendamos a nuestros usuarios proteger también sus credenciales de acceso.",
    ],
  },
  {
    number: "08",
    title: "Conservación de los datos",
    paragraphs: [
      "Conservaremos la información únicamente durante el tiempo necesario para prestar nuestros servicios, cumplir obligaciones legales, resolver disputas o prevenir actividades fraudulentas.",
      "Cuando un usuario solicite la eliminación de su cuenta, eliminaremos o anonimizararemos la información cuando sea legalmente posible hacerlo.",
    ],
  },
  {
    number: "09",
    title: "Derechos del usuario",
    paragraphs: [
      "Los usuarios pueden solicitar el acceso, actualización, corrección o eliminación de su información personal cuando corresponda, así como realizar consultas relacionadas con el tratamiento de sus datos.",
      "Para ejercer cualquiera de estos derechos puedes comunicarte con nosotros mediante el correo electrónico hola@platillo.mx.",
    ],
  },
  {
    number: "10",
    title: "Cambios a esta política",
    paragraphs: [
      "Podremos actualizar esta Política de Privacidad cuando sea necesario para reflejar cambios en nuestros servicios, en la legislación aplicable o en nuestras prácticas internas.",
      "La fecha de la última actualización aparecerá al inicio de este documento. El uso continuo de Platillo después de cualquier modificación implica la aceptación de la versión vigente de esta política.",
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
              Legal y privacidad
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
              Política de privacidad
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
              En Platillo nos tomamos en serio la privacidad de los negocios y
              de sus clientes. Aquí explicamos cómo recopilamos, utilizamos y
              protegemos la información.
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
                    Contacto
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
                    ¿Tienes alguna duda sobre tus datos?
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
                    Puedes comunicarte con nosotros y te ayudaremos con
                    cualquier consulta relacionada con privacidad.
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
