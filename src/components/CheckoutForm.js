"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { useRouter } from "next/navigation";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ restaurant }) {
  const [entrega, setEntrega] = useState("");
  const [pago, setPago] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calle, setCalle] = useState("");
  const [colonia, setColonia] = useState("");
  const [numero, setNumero] = useState("");
  const [postal, setPostal] = useState("");
  const [cambio, setCambio] = useState("");
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const stripe = useStripe();
  const elements = useElements();

  const [cardError, setCardError] = useState("");

  const cart = useCartStore((state) => state.cart);
  console.log(cart);
  const total = cart.reduce(
    (acc, item) => acc + item.totalPrice * item.quantity,
    0,
  );

  useEffect(() => {
    if (cart.length === 0) router.back();
  }, [cart, router]);

  function optionsToString(options) {
    if (!options) return "";

    return Object.entries(options)
      .map(([categoria, valor]) => {
        if (Array.isArray(valor)) {
          const items = valor.map((v) => v?.name).filter(Boolean);
          return items.length ? `${categoria}: ${items.join(", ")}` : "";
        }

        if (typeof valor === "object" && valor !== null) {
          if ("name" in valor) {
            return `${categoria}: ${valor.name}`;
          }

          const items = Object.values(valor)
            .map((v) => {
              if (!v) return "";
              const name = v.name || "";
              const qty = v.quantity ?? null;

              if (qty && qty > 1) return `${qty} ${name}`;
              if (qty === 1) return name;

              return name;
            })
            .filter(Boolean);

          return items.length ? `${categoria}: ${items.join(", ")}` : "";
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  const cashEnabled = restaurant.paymentMethods?.cash === true;
  const transferData = restaurant.paymentMethods?.transfer;
  const transferEnabled = transferData?.enabled === true;
  const cardEnabled = restaurant.paymentMethods?.card === true;

  // Validaciones individuales
  const nombreValido = nombre.trim() !== "";
  const telefonoValido = telefono.trim() !== "";
  const entregaValida = entrega !== "";
  const domicilioValido =
    entrega !== "domicilio" ||
    (calle.trim() !== "" &&
      numero.trim() !== "" &&
      colonia.trim() !== "" &&
      postal.trim() !== "");
  const pagoValido = pago !== "";
  const cambioValido =
    pago !== "efectivo" || (cambio !== "" && Number(cambio) >= total);

  const cardReady = !loading && stripe && elements;
  const cardValid = pago !== "tarjeta" || cardReady;

  const formularioValido =
    nombreValido &&
    telefonoValido &&
    entregaValida &&
    domicilioValido &&
    pagoValido &&
    cambioValido &&
    cardValid;

  const handleConfirmar = async () => {
    if (loading) return;

    setIntentoEnvio(true);
    if (!formularioValido) return;

    setLoading(true);

    try {
      const pedido = {
        restaurantId: cart[0]?.restaurantId,
        cliente: {
          nombre,
          telefono,
        },
        entrega:
          entrega === "domicilio"
            ? {
                tipo: "domicilio",
                calle,
                numero,
                colonia,
                postal,
              }
            : {
                tipo: "local",
              },
        pago: {
          metodo: pago,
          cambio: pago === "efectivo" ? Number(cambio) : undefined,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          options: item.options,
          note: item.note || null,
          totalPrice: item.totalPrice * item.quantity,
        })),
        total,
      };

      // 🧾 1. CREAR ORDEN (backend decide todo)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });

      const data = await res.json();
      console.log(data)

      if (!data.ok) {
        setCardError(data.error || "Error al crear pedido");
        setLoading(false);
        return;
      }

      // 💳 2. SI ES TARJETA → CONFIRMAR STRIPE
      if (pago === "tarjeta") {
        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        const clientSecret = data.payment?.clientSecret;

        if (!clientSecret) {
          setCardError("No se pudo iniciar el pago");
          setLoading(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name,
                phone: telefono,
              },
            },
          },
        );

        if (error) {
          setCardError(error.message);
          setLoading(false);
          return;
        }

        if (paymentIntent.status !== "succeeded") {
          setCardError("El pago no se completó");
          setLoading(false);
          return;
        }

        console.log("✅ Pago exitoso, orden:");
      } else {
        console.log("✅ Orden creada:");
      }
    } finally {
      setLoading(false);
    }
  };

  const errorClass = "border-red-400 bg-red-50";
  const normalInputClass =
    "p-2 rounded-md outline-none w-full bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] placeholder-[var(--gray-color)] text-[var(--gray-color)]";
  const errorInputClass =
    "p-2 rounded-md outline-none w-full bg-red-50 border border-[1.6px] border-red-400 placeholder-[var(--gray-color)] text-[var(--gray-color)]";

  return (
    <div className="relative max-w-[420px] mx-auto h-[100dvh] flex flex-col gap-3 p-4 pt-7 items-center overflow-y-auto">
      <h1 className="font-bold w-full text-center mb-3">Tu pedido</h1>
      <button
        onClick={() => router.back()}
        className="absolute top-5 left-4 w-9 h-9 cursor-pointer rounded-md bg-[var(--gray-color)] border border-[1.6px] border-[var(--gray-color)]  flex items-center justify-center"
      >
        <svg
          className="w-7"
          xmlns="http://www.w3.org/2000/svg"
          height="48px"
          viewBox="0 -960 960 960"
          width="48px"
          fill="white"
        >
          <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z" />
        </svg>
      </button>

      {/* Nombre */}

      <div
        className={`flex flex-col w-full gap-2 p-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-md`}
      >
        <p className="font-bold text-[18px]">Nombre</p>
        <input
          className={
            intentoEnvio && !nombreValido ? errorInputClass : normalInputClass
          }
          type="text"
          placeholder="Ingresa tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {intentoEnvio && !nombreValido && (
          <p className="text-xs text-red-500">Este campo es obligatorio.</p>
        )}
      </div>

      {/* Teléfono */}
      <div
        className={`flex flex-col w-full gap-2 p-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-md`}
      >
        <p className="font-bold text-[18px]">Teléfono</p>
        <input
          className={
            intentoEnvio && !telefonoValido ? errorInputClass : normalInputClass
          }
          type="tel"
          placeholder="Ingresa tu número"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
        />
        {intentoEnvio && !telefonoValido && (
          <p className="text-xs text-red-500">Este campo es obligatorio.</p>
        )}
      </div>

      {/* Método de entrega */}
      <div
        className={`flex flex-col w-full gap-2 p-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-md items-start`}
      >
        <p className="font-bold text-[18px]">Método de entrega</p>
        <div className="w-full flex flex-col gap-3">
          {/* A domicilio */}
          <div
            className={`flex flex-col w-full gap-2 overflow-hidden transition-all duration-200 ${entrega === "domicilio" ? "max-h-[500px]" : "max-h-4"}`}
          >
            <label className="flex items-center w-full gap-2 cursor-pointer">
              <input
                type="radio"
                name="entrega"
                value="domicilio"
                onChange={(e) => setEntrega(e.target.value)}
                className="shrink-0"
              />
              <p>A domicilio</p>
            </label>
            <div className="flex flex-col w-full rounded-md bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] text-black p-3 gap-2">
              <div className="flex flex-col">
                <p className="font-semibold">Calle</p>
                <input
                  className="outline-none w-full border-b border-b-[1.6px] border-[var(--gray-color)] placeholder-[var(--gray-color)] text-[var(--gray-color)]"
                  type="text"
                  placeholder="Ingresa tu calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold">Número de casa</p>
                <input
                  className="outline-none w-full border-b border-b-[1.6px] border-[var(--gray-color)] placeholder-[var(--gray-color)] text-[var(--gray-color)]"
                  type="number"
                  placeholder="Ingresa tu número de casa"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold">Colonia</p>
                <input
                  className="outline-none w-full border-b border-b-[1.6px] border-[var(--gray-color)] placeholder-[var(--gray-color)] text-[var(--gray-color)]"
                  type="text"
                  placeholder="Ingresa tu colonia"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold">Código Postal</p>
                <input
                  className="outline-none w-full border-b border-b-[1.6px] border-[var(--gray-color)] placeholder-[var(--gray-color)] text-[var(--gray-color)]"
                  type="tel"
                  placeholder="Ingresa tu código postal"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {intentoEnvio && !domicilioValido && (
                <p className="text-xs text-red-500">
                  Completa todos los campos de dirección.
                </p>
              )}
            </div>
          </div>

          {/* Recoger en local */}
          <div
            className={`flex flex-col w-full gap-2 overflow-hidden transition-all duration-200 ${entrega === "local" ? "max-h-[500px]" : "max-h-4"}`}
          >
            <label className="flex items-center w-full gap-2 cursor-pointer">
              <input
                type="radio"
                name="entrega"
                value="local"
                onChange={(e) => setEntrega(e.target.value)}
                className="shrink-0"
              />
              <p>Recoger en local</p>
            </label>
            <div className="flex flex-col w-full rounded-md bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] text-black p-3 gap-2">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Dirección del negocio</p>
                <p className="font-normal">{restaurant.address}</p>
              </div>
            </div>
          </div>
        </div>
        {intentoEnvio && !entregaValida && (
          <p className="text-xs text-red-500">
            Selecciona un método de entrega.
          </p>
        )}
      </div>

      {/* Método de pago */}
      {(cashEnabled || transferEnabled) && (
        <div
          className={`flex flex-col w-full gap-2 p-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-md items-start`}
        >
          <p className="font-bold text-[18px]">Método de pago</p>
          <div className="w-full flex flex-col gap-3">
            {/* Efectivo */}
            {cashEnabled && (
              <div
                className={`flex flex-col w-full gap-2 overflow-hidden transition-all duration-200 ${pago === "efectivo" ? "max-h-[500px]" : "max-h-4"}`}
              >
                <label className="flex items-center w-full gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pago"
                    value="efectivo"
                    onChange={(e) => setPago(e.target.value)}
                    className="shrink-0"
                  />
                  <p>Efectivo</p>
                </label>
                <div className="flex flex-col w-full rounded-md bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] text-black p-3 gap-2">
                  <div className="flex flex-col">
                    <p className="font-semibold">¿Con cuánto vas a pagar?</p>
                    <input
                      className="outline-none w-full border-b border-b-[1.6px] border-[var(--gray-color)] placeholder-[var(--gray-color)] text-[var(--gray-color)]"
                      type="number"
                      placeholder="Ej. 200"
                      value={cambio}
                      onChange={(e) => setCambio(e.target.value)}
                    />
                  </div>
                  {/* Alerta cambio insuficiente — se muestra en tiempo real, sin necesitar intento de envío */}
                  {cambio !== "" && Number(cambio) < total && (
                    <p className="text-xs text-red-500">
                      El monto es menor al total (${total} MXN).
                    </p>
                  )}
                  {intentoEnvio && cambio === "" && (
                    <p className="text-xs text-red-500">
                      Ingresa con cuánto vas a pagar.
                    </p>
                  )}
                  <p className="text-xs text-[var(--gray-color)]">
                    Te entregaremos tu cambio exacto.
                  </p>
                </div>
              </div>
            )}

            {/* Transferencia */}
            {transferEnabled && (
              <div
                className={`flex flex-col w-full gap-2 overflow-hidden transition-all duration-200 ${pago === "transferencia" ? "max-h-[500px]" : "max-h-4"}`}
              >
                <label className="flex items-center w-full gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pago"
                    value="transferencia"
                    onChange={(e) => setPago(e.target.value)}
                    className="shrink-0"
                  />
                  <p>Transferencia</p>
                </label>
                <div className="flex flex-col w-full rounded-md bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] text-black p-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Banco</p>
                    <p className="text-black text-sm">{transferData.bank}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">CLABE / Número de cuenta</p>
                    <p className="text-black text-sm">{transferData.clabe}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Titular</p>
                    <p className="text-black text-sm">{transferData.holder}</p>
                  </div>
                  <p className="text-xs text-red-500 font-bold">
                    *ENVÍA TU COMPROBANTE POR WHATSAPP AL TERMINAR (
                    {restaurant.phone}).
                  </p>
                </div>
              </div>
            )}

            {/* Tarjeta */}
            {cardEnabled && (
              <div
                className={`flex flex-col w-full gap-2 overflow-hidden transition-all duration-200 ${
                  pago === "tarjeta" ? "max-h-[500px]" : "max-h-4"
                }`}
              >
                <label className="flex items-center w-full gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pago"
                    value="tarjeta"
                    onChange={(e) => setPago(e.target.value)}
                    className="shrink-0"
                  />
                  <p>Tarjeta</p>
                </label>

                <div className="flex flex-col w-full rounded-md bg-[var(--light-gray)] border border-[1.6px] border-[var(--half-gray)] text-black p-3 gap-3">
                  <p className="font-semibold">Pago con tarjeta</p>

                  <div className="p-3 bg-white border border-[1.6px] border-[var(--gray-color)] rounded-md">
                    <CardElement
                      options={{
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#000",
                            "::placeholder": {
                              color: "#999",
                            },
                          },
                          invalid: {
                            color: "#e53935",
                          },
                        },
                      }}
                      onChange={(e) => setCardError(e.error?.message || "")}
                    />
                  </div>

                  {cardError && (
                    <p className="text-xs text-red-500">{cardError}</p>
                  )}

                  <p className="text-xs text-[var(--gray-color)]">
                    Pagos procesados de forma segura por Stripe
                  </p>
                </div>
              </div>
            )}
          </div>
          {intentoEnvio && !pagoValido && (
            <p className="text-xs text-red-500">
              Selecciona un método de pago.
            </p>
          )}
        </div>
      )}

      {/* Total */}
      {/* Total */}
      <div className="flex flex-col w-full p-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] rounded-md gap-3">
        {/* Resumen del pedido */}
        <div className="flex flex-col gap-3">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-sm object-cover shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="font-semibold text-[16px] leading-tight">
                    {item.quantity}x {item.name}
                  </p>
                  <p className="font-semibold text-[16px] shrink-0">
                    ${item.totalPrice * item.quantity}
                  </p>
                </div>
                {item.options && optionsToString(item.options) && (
                  <p className="text-sm text-[var(--gray-color)] leading-tight mt-0.5 truncate">
                    {optionsToString(item.options)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-[1.6px] bg-[var(--half-gray)]" />

        <div className="flex justify-between items-center">
          <p className="font-bold text-[18px]">TOTAL</p>
          <p className="font-bold text-[18px]">${total} MXN</p>
        </div>

        <div className="w-full h-[1.6px] bg-[var(--half-gray)]" />

        <button
          onClick={handleConfirmar}
          disabled={!formularioValido || loading}
          className="cursor-pointer w-full p-4 bg-[var(--accent-color)] text-white font-bold text-[16px] rounded-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-5 h-5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                />
              </svg>
              Enviando pedido...
            </>
          ) : (
            "Confirmar pedido"
          )}
        </button>
      </div>
    </div>
  );
}
