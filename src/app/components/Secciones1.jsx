// Sección: Problema
function IconoBolsa({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 7.00151L8.25 6C8.25 3.92893 9.92893 2.25 12 2.25C14.0711 2.25 15.75 3.92893 15.75 6V7L15.75 7.00151C18.4344 7.0136 19.8606 7.1222 20.6606 8.09803C21.5608 9.19607 21.2287 10.8563 20.5646 14.1767L19.9646 17.1767C19.5029 19.4856 19.272 20.6401 18.4425 21.32C17.6131 22 16.4358 22 14.0812 22H9.9188C7.56417 22 6.38686 22 5.55742 21.32C4.72799 20.6401 4.4971 19.4856 4.03532 17.1767L3.43532 14.1767C2.77123 10.8563 2.43919 9.19607 3.33936 8.09803C4.13936 7.12219 5.56562 7.0136 8.25 7.00151ZM9.75 6C9.75 4.75736 10.7574 3.75 12 3.75C13.2426 3.75 14.25 4.75736 14.25 6V7H9.75V6ZM15 11C15.5523 11 16 10.5523 16 10C16 9.44772 15.5523 9 15 9C14.4477 9 14 9.44772 14 10C14 10.5523 14.4477 11 15 11ZM9.99998 10C9.99998 10.5523 9.55226 11 8.99998 11C8.44769 11 7.99998 10.5523 7.99998 10C7.99998 9.44772 8.44769 9 8.99998 9C9.55226 9 9.99998 9.44772 9.99998 10Z"
        fill={color}
      />
    </svg>
  );
}

function IconoReloj({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V11.6893L15.0303 13.9697C15.3232 14.2626 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2626 15.3232 13.9697 15.0303L11.4697 12.5303C11.329 12.3897 11.25 12.1989 11.25 12V8C11.25 7.58579 11.5858 7.25 12 7.25Z"
        fill="var(--accent-color)"
      />
    </svg>
  );
}

function IconoError({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z"
        fill={color}
      />
    </svg>
  );
}

function IconoPedido({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M5.97 1H3.03C1.76 1 1 1.76 1 3.03V5.97C1 7.24 1.76 8 3.03 8H5.97C7.24 8 8 7.24 8 5.97V3.03C8 1.76 7.24 1 5.97 1ZM6.47 5.56C6.72 5.81 6.72 6.22 6.47 6.47C6.34 6.59 6.17 6.65 6.01 6.65C5.85 6.65 5.69 6.59 5.56 6.47L4.49 5.41L3.45 6.47C3.32 6.59 3.16 6.65 2.98 6.65C2.82 6.65 2.66 6.59 2.53 6.47C2.28 6.22 2.28 5.81 2.53 5.56L3.6 4.5L2.54 3.45C2.29 3.2 2.29 2.79 2.54 2.54C2.79 2.29 3.2 2.29 3.45 2.54L4.49 3.6L5.55 2.54C5.8 2.29 6.21 2.29 6.46 2.54C6.71 2.79 6.71 3.2 6.46 3.45L5.41 4.5L6.47 5.56Z"
        fill={color}
      />
      <path
        d="M21.4995 15.8197C21.4995 15.9697 21.4495 16.1197 21.3195 16.2497C19.8695 17.7097 17.2895 20.3097 15.8095 21.7997C15.6795 21.9397 15.5095 21.9997 15.3395 21.9997C15.0095 21.9997 14.6895 21.7397 14.6895 21.3597V17.8597C14.6895 16.3997 15.9295 15.1897 17.4495 15.1897C18.3995 15.1797 19.7195 15.1797 20.8495 15.1797C21.2395 15.1797 21.4995 15.4897 21.4995 15.8197Z"
        fill={color}
      />
      <path
        d="M16.63 2H10.5C9.95 2 9.5 2.45 9.5 3V6.5C9.5 8.16 8.16 9.5 6.5 9.5H3.5C2.95 9.5 2.5 9.95 2.5 10.5V17.13C2.5 19.82 4.68 22 7.37 22H12.19C12.74 22 13.19 21.55 13.19 21V17.86C13.19 15.56 15.1 13.69 17.45 13.69C17.98 13.68 19.27 13.68 20.5 13.68C21.05 13.68 21.5 13.24 21.5 12.68V6.87C21.5 4.18 19.32 2 16.63 2ZM8.72 17.01H6.08C5.67 17.01 5.33 16.67 5.33 16.26C5.33 15.84 5.67 15.5 6.08 15.5H8.72C9.15 15.5 9.47 15.84 9.47 16.26C9.47 16.67 9.15 17.01 8.72 17.01ZM11.51 13.3H6.08C5.67 13.3 5.33 12.96 5.33 12.55C5.33 12.13 5.67 11.79 6.08 11.79H11.51C11.92 11.79 12.27 12.13 12.27 12.55C12.27 12.96 11.92 13.3 11.51 13.3Z"
        fill={color}
      />
    </svg>
  );
}

function IconoFuego({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M17.4,8.38A7.1,7.1,0,0,1,15,3a1,1,0,0,0-1.55-.83,10.89,10.89,0,0,0-5,6.73A4.37,4.37,0,0,1,8,7.77,1,1,0,0,0,7.27,7a1,1,0,0,0-1,.25C5,8.58,4,12,4,14c0,5.08,2.92,8,8,8s8-3,8-8C20,11.22,18.62,9.71,17.4,8.38Z"
        fill={color}
      />
    </svg>
  );
}

function IconoWhatsapp({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M17,0C8.7,0,2,6.7,2,15c0,3.4,1.1,6.6,3.2,9.2l-2.1,6.4c-0.1,0.4,0,0.8,0.3,1.1C3.5,31.9,3.8,32,4,32c0.1,0,0.3,0,0.4-0.1 l6.9-3.1C13.1,29.6,15,30,17,30c8.3,0,15-6.7,15-15S25.3,0,17,0z M25.7,20.5c-0.4,1.2-1.9,2.2-3.2,2.4C22.2,23,21.9,23,21.5,23 c-0.8,0-2-0.2-4.1-1.1c-2.4-1-4.8-3.1-6.7-5.8L10.7,16C10.1,15.1,9,13.4,9,11.6c0-2.2,1.1-3.3,1.5-3.8c0.5-0.5,1.2-0.8,2-0.8 c0.2,0,0.3,0,0.5,0c0.7,0,1.2,0.2,1.7,1.2l0.4,0.8c0.3,0.8,0.7,1.7,0.8,1.8c0.3,0.6,0.3,1.1,0,1.6c-0.1,0.3-0.3,0.5-0.5,0.7 c-0.1,0.2-0.2,0.3-0.3,0.3c-0.1,0.1-0.1,0.1-0.2,0.2c0.3,0.5,0.9,1.4,1.7,2.1c1.2,1.1,2.1,1.4,2.6,1.6l0,0c0.2-0.2,0.4-0.6,0.7-0.9 l0.1-0.2c0.5-0.7,1.3-0.9,2.1-0.6c0.4,0.2,2.6,1.2,2.6,1.2l0.2,0.1c0.3,0.2,0.7,0.3,0.9,0.7C26.2,18.5,25.9,19.8,25.7,20.5z"
        fill={color}
      />
    </svg>
  );
}

function IconoProhibido({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 9.50853 21.0889 7.22987 19.5816 5.47906L5.47905 19.5816C7.22987 21.0889 9.50853 22 12 22Z"
        fill={color}
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.4915 2.91114 16.7701 4.41839 18.5209L18.5209 4.41839C16.7701 2.91114 14.4915 2 12 2Z"
        fill={color}
      />
    </svg>
  );
}

function IconoInfinito({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M0 16q0 2.496 1.216 4.608t3.328 3.328 4.608 1.216q1.504 0 3.072-0.576-1.472-1.824-2.272-4.064-0.544 0.064-0.8 0.064-1.888 0-3.232-1.344t-1.344-3.232 1.344-3.232 3.232-1.344 3.232 1.344 1.344 3.232q0 2.496 1.216 4.608t3.328 3.328 4.576 1.216 4.608-1.216 3.328-3.328 1.216-4.608-1.216-4.576-3.328-3.328-4.608-1.216q-1.504 0-3.072 0.544 1.472 1.824 2.272 4.096 0.544-0.096 0.8-0.096 1.888 0 3.232 1.344t1.344 3.232q0 1.92-1.344 3.264t-3.232 1.312q-1.888 0-3.232-1.312t-1.344-3.264q0-2.464-1.216-4.576t-3.328-3.328-4.576-1.216-4.608 1.216-3.328 3.328-1.216 4.576z"
        fill={color}
      />
    </svg>
  );
}

function IconoPersonalizacion({
  color = "currentColor",
  size = 24,
  className = "",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM10.95 17.51C10.66 17.8 10.11 18.08 9.71 18.14L7.25 18.49C7.16 18.5 7.07 18.51 6.98 18.51C6.57 18.51 6.19 18.37 5.92 18.1C5.59 17.77 5.45 17.29 5.53 16.76L5.88 14.3C5.94 13.89 6.21 13.35 6.51 13.06L10.97 8.6C11.05 8.81 11.13 9.02 11.24 9.26C11.34 9.47 11.45 9.69 11.57 9.89C11.67 10.06 11.78 10.22 11.87 10.34C11.98 10.51 12.11 10.67 12.19 10.76C12.24 10.83 12.28 10.88 12.3 10.9C12.55 11.2 12.84 11.48 13.09 11.69C13.16 11.76 13.2 11.8 13.22 11.81C13.37 11.93 13.52 12.05 13.65 12.14C13.81 12.26 13.97 12.37 14.14 12.46C14.34 12.58 14.56 12.69 14.78 12.8C15.01 12.9 15.22 12.99 15.43 13.06L10.95 17.51ZM17.37 11.09L16.45 12.02C16.39 12.08 16.31 12.11 16.23 12.11C16.2 12.11 16.16 12.11 16.14 12.1C14.11 11.52 12.49 9.9 11.91 7.87C11.88 7.76 11.91 7.64 11.99 7.57L12.92 6.64C14.44 5.12 15.89 5.15 17.38 6.64C18.14 7.4 18.51 8.13 18.51 8.89C18.5 9.61 18.13 10.33 17.37 11.09Z"
        fill={color}
      />
    </svg>
  );
}

function IconoBilletes({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M17 3.5H7C4 3.5 2 5 2 8.5V15.5C2 19 4 20.5 7 20.5H17C20 20.5 22 19 22 15.5V8.5C22 5 20 3.5 17 3.5ZM6.25 14.5C6.25 14.91 5.91 15.25 5.5 15.25C5.09 15.25 4.75 14.91 4.75 14.5V9.5C4.75 9.09 5.09 8.75 5.5 8.75C5.91 8.75 6.25 9.09 6.25 9.5V14.5ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15ZM19.25 14.5C19.25 14.91 18.91 15.25 18.5 15.25C18.09 15.25 17.75 14.91 17.75 14.5V9.5C17.75 9.09 18.09 8.75 18.5 8.75C18.91 8.75 19.25 9.09 19.25 9.5V14.5Z"
        fill={color}
      />
    </svg>
  );
}

function IconoTarjeta({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2.32803 6.01511 2.09185 7.22882 2.02572 9.25H21.9743C21.9082 7.22882 21.672 6.01511 20.8284 5.17157C19.6569 4 17.7712 4 14 4Z"
        fill={color}
      />
      <path
        d="M10 20H14C17.7712 20 19.6569 20 20.8284 18.8284C22 17.6569 22 15.7712 22 12C22 11.5581 22 11.142 21.9981 10.75H2.00189C2 11.142 2 11.5581 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H10C10.4142 15.25 10.75 15.5858 10.75 16C10.75 16.4142 10.4142 16.75 10 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.75 16C11.75 15.5858 12.0858 15.25 12.5 15.25H14C14.4142 15.25 14.75 15.5858 14.75 16C14.75 16.4142 14.4142 16.75 14 16.75H12.5C12.0858 16.75 11.75 16.4142 11.75 16Z"
        fill="white"
      />
    </svg>
  );
}

function IconoBanco({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12.6708,2.21744 L21.1708,6.96744 C21.679,7.22153 22,7.74092 22,8.30908 L22,9.75006 C22,10.4404 21.4404,11.0001 20.75,11.0001 L20,11.0001 L20,19.0001 L21,19.0001 C21.5523,19.0001 22,19.4478 22,20.0001 C22,20.5524 21.5523,21.0001 21,21.0001 L3,21.0001 C2.44772,21.0001 2,20.5524 2,20.0001 C2,19.4478 2.44772,19.0001 3,19.0001 L4,19.0001 L4,11.0001 L3.25,11.0001 C2.55964,11.0001 2,10.4404 2,9.75006 L2,8.30908 C2,7.78826667 2.26973757,7.30843368 2.70611413,7.03636428 L11.3292,2.21744 C11.7515,2.0063 12.2485,2.0063 12.6708,2.21744 Z M17,11.0001 L7,11.0001 L7,19.0001 L9,19.0001 L9,13.0001 L11,13.0001 L11,19.0001 L13,19.0001 L13,13.0001 L15,13.0001 L15,19.0001 L17,19.0001 L17,11.0001 Z M12,6.00012 C11.4477,6.00012 11,6.44784 11,7.00012 C11,7.55241 11.4477,8.00012 12,8.00012 C12.5523,8.00012 13,7.55241 13,7.00012 C13,6.44784 12.5523,6.00012 12,6.00012 Z"
        fill={color}
      />
    </svg>
  );
}

function IconoTelefono({ color = "currentColor", size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 0 24 24"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 19C8.8284 19 9.5 19.6716 9.5 20.5C9.5 21.3284 8.8284 22 8 22C7.1716 22 6.5 21.3284 6.5 20.5C6.5 19.6716 7.1716 19 8 19zM3 0H13C14.6569 0 16 1.34315 16 3V21C16 22.6569 14.6569 24 13 24H3C1.34315 24 0 22.6569 0 21V3C0 1.34315 1.34315 0 3 0z"
        fill={color}
      />
    </svg>
  );
}

export function Problema() {
  const problemas = [
    {
      icono: IconoReloj,
      title: "Clientes esperando respuesta",
      desc: "Tu cliente mandó su pedido hace 10 minutos. Tú estás ocupado. El pedido se pierde.",
    },
    {
      icono: IconoPedido,
      title: "Pedidos perdidos entre mensajes",
      desc: "Entre notas de voz, fotos y texto, un pedido se va sin querer al scroll.",
    },
    {
      icono: IconoError,
      title: "Errores al interpretar pedidos",
      desc: "Sin cebolla lo leíste tarde. El cliente ya llegó y hay que rehacer todo.",
    },
    {
      icono: IconoFuego,
      title: "Saturación en horas pico",
      desc: "Viernes por la noche: 30 mensajes en WhatsApp, la cocina esperando, tú sin poder con todo.",
    },
  ];

  return (
    <section style={{ padding: "100px 24px", background: "#fafafa" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
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
            El problema real
          </span>
          <h2
            style={{
              fontSize: "clamp(30px, 4.5vw, 50px)",
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 18,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Tu restaurante no debería
            <br />
            depender de <span style={{ color: "#ed400b" }}>WhatsApp.</span>
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#666",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto",
              fontFamily: "Onest, sans-serif",
            }}
          >
            WhatsApp fue diseñado para chatear, no para tomar pedidos. Cada
            mensaje manual que procesas es tiempo, dinero y clientes que se van.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
          className="problema-grid"
        >
          {problemas.map((p, i) => {
            const Icono = p.icono;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #ededed",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transition: "border-color 0.2s, transform 0.2s",
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
                <div
                  className="p-2 flex items-center justify-center rounded-sm bg-[var(--accent-color)] w-9 h-9"
                  style={{ marginBottom: 5 }}
                >
                  <Icono size={20} color="white" />
                </div>

                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 8,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.65,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "#fff7f5",
            border: "1px solid #fcd8cc",
            borderRadius: 16,
            padding: "22px 28px",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: 16,
              color: "#444",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Cada pedido perdido es dinero que sale de tu negocio. Los negocios
            que automatizan sus pedidos{" "}
            <strong style={{ color: "#000" }}>
              aumentan sus ventas hasta 40%
            </strong>{" "}
            sin contratar a nadie más.
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
    {
      num: "01",
      emoji: "",
      title: "Cliente escanea el QR o abre el enlace",
      desc: "Pega el QR en tu local, compártelo en Instagram o en tu bio. Se abre desde el celular sin descargar nada.",
    },
    {
      num: "02",
      emoji: "",
      title: "Elige, personaliza y hace su pedido",
      desc: "Navega el menú, agrega productos, personaliza opciones y confirma en segundos.",
    },
    {
      num: "03",
      emoji: "",
      title: "Tu negocio recibe el pedido al instante",
      desc: "Notificación en tu app con todos los detalles: qué pidieron, cómo lo quieren y cómo pagan.",
    },
    {
      num: "04",
      emoji: "",
      title: "El cliente recibe actualizaciones por WhatsApp",
      desc: "Cuando cambias el estado del pedido, tu cliente recibe un WhatsApp automático. Cero llamadas.",
    },
  ];

  return (
    <section
      id="como-funciona"
      style={{ padding: "100px 24px", background: "#fff" }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
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
            Cómo funciona
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
            Así funciona Platillo
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#666",
              lineHeight: 1.65,
              fontFamily: "Onest, sans-serif",
            }}
          >
            De pedido a entrega, todo automatizado. Tu equipo solo cocina.
          </p>
        </div>

        {pasos.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#ed400b",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Onest, sans-serif",
                  flexShrink: 0,
                }}
              >
                {p.num}
              </div>
              {i < pasos.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: "#ededed",
                    margin: "8px 0",
                    minHeight: 32,
                  }}
                />
              )}
            </div>
            <div style={{ paddingBottom: i < pasos.length - 1 ? 40 : 0 }}>
              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "#000",
                  marginBottom: 8,
                  letterSpacing: -0.3,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "#666",
                  lineHeight: 1.7,
                  fontFamily: "Onest, sans-serif",
                }}
              >
                {p.desc}
              </p>
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
    {
      icono: IconoWhatsapp,
      title: "WhatsApp automático",
      desc: "Tu cliente recibe actualizaciones sin que tú mandes ni un mensaje.",
    },
    {
      icono: IconoProhibido,
      title: "Sin comisiones",
      desc: "Costo fijo mensual. Sin importar cuánto vendas, siempre pagas lo mismo.",
    },
    {
      icono: IconoInfinito,
      title: "Productos ilimitados",
      desc: "Sube todo tu menú. Sin límite de categorías ni productos.",
    },
    {
      icono: IconoPersonalizacion,
      title: "Personalización total",
      desc: "Opciones, extras, variantes. El cliente personaliza su pedido al instante.",
    },
    {
      icono: IconoBilletes, // si tienes uno de "efectivo", si no avísame y te lo hago
      title: "Pago en efectivo",
      desc: "Acepta pedidos que se pagan en el local o a domicilio.",
    },
    {
      icono: IconoTarjeta,
      title: "Pago con tarjeta",
      desc: "Conecta tu terminal o activa pagos en línea fácilmente.",
    },
    {
      icono: IconoBanco,
      title: "Pago por transferencia",
      desc: "El cliente ve tu CLABE o número directo en el checkout.",
    },
    {
      icono: IconoTelefono,
      title: "App para tu negocio",
      desc: "Gestiona pedidos, actualiza estados y revisa analíticas desde tu celular.",
    },
  ];

  return (
    <section
      id="beneficios"
      style={{ padding: "100px 24px", background: "#fafafa" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
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
            Beneficios
          </span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              marginBottom: 14,
              fontFamily: "Onest, sans-serif",
            }}
          >
            Todo lo que necesitas.
            <br />
            Nada de lo que no.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#666",
              lineHeight: 1.65,
              maxWidth: 480,
              margin: "0 auto",
              fontFamily: "Onest, sans-serif",
            }}
          >
            Platillo está diseñado para negocios de comida reales, no para
            corporativos con equipos de IT.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="beneficios-grid"
        >
 {items.map((b, i) => {
            const Icono = b.icono;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #ededed",
                  borderRadius: 16,
                  padding: "26px 22px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#fcd8cc";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#ededed";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="p-2 flex items-center justify-center rounded-sm bg-[var(--accent-color)] w-9 h-9"
                  style={{ marginBottom: 5 }}
                >
                  <Icono size={20} color="white" />
                </div>

                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 6,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.65,
                    fontFamily: "Onest, sans-serif",
                  }}
                >
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) { .beneficios-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 500px) { .beneficios-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
