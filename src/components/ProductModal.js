import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/useCartStore";

export default function ProductOptionsModal({ product, onClose }) {
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const max = Number(product.max || 99);

  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const clearCart = useCartStore((state) => state.clearCart);

  function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // fallback
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  useEffect(() => {
    const base =
      product.priceType === "dynamic"
        ? Number(product.basePrice || 0)
        : Number(product.price);

    let extras = 0;

    Object.values(selectedOptions).forEach((opt) => {
      // CHECKBOX (array)
      if (Array.isArray(opt)) {
        opt.forEach((item) => {
          extras += Number(item.price || 0);
        });
        return;
      }

      // ADDABLE (objeto con múltiples items)
      if (typeof opt === "object") {
        const values = Object.values(opt);

        // si tiene quantity → es addable
        if (values.some((item) => item.quantity !== undefined)) {
          values.forEach((item) => {
            extras += Number(item.price || 0) * (item.quantity || 0);
          });
          return;
        }

        // RADIO (objeto simple)
        extras += Number(opt.price || 0);
      }
    });

    setFinalPrice(base + extras);
  }, [selectedOptions, product]);

  return (
    <div className="absolute fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
      <div className="bg-white w-[90%] md:w-[500px] flex flex-col gap-0 rounded-[10px] max-w-[350px]">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="font-bold text-lg">
            {" "}
            {`Subtotal: $${finalPrice} MXN`}{" "}
          </h3>
          <button
            onClick={onClose}
            className="flex flex-col items-center justify-center cursor-pointer w-7 h-7 text-white rounded-[6px] bg-[var(--accent-color)]"
          >
            <svg
              className="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              width="48px"
              fill="#e3e3e3"
            >
              <path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
            </svg>
          </button>
        </div>

        {/* Opciones dinámicas */}
        {/* SCROLL OPCIONES */}

        <div className="flex flex-col max-h-[300px] overflow-y-auto gap-2 p-4 pt-0">
          <div className="h-[200px] w-full bg-red-200 rounded rounded-t-none">
            <img
              src={product.image}
              className="w-full h-full object-cover rounded rounded-t-none"
            />
          </div>

          <h1 className="w-full text-center mt-2">{product.name}</h1>
          <p className="w-full text-center mb-2">{product.description}</p>

          {product.options?.map((opt, idx) => (
            <div key={idx} className="flex flex-col gap-[6px]">
              <div className="flex flex-row justify-between">
                <p className="font-semibold flex items-center justify-center">
                  {opt.title}
                </p>
                <p
                  className={`font-semibold px-2 py-1 rounded-[4px] flex items-center justify-center text-center text-[14px] bg-[var(--light-gray)] ${opt.required ? "" : "hidden"}`}
                >
                  Obligatorio
                </p>
              </div>

              <p className="text-[14px] mt-1 mb-1 text-[var(--gray-color)]">{`Puedes añadir hasta ${opt.maxSelectable} de ${opt.title}`}</p>

              {/* Radio */}
              {opt.type === "radio" &&
                opt.choices.map((choice, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-row gap-2">
                      <input
                        className="accent-[var(--accent-color)]"
                        type="radio"
                        name={opt.title}
                        value={choice.name}
                        onChange={() => {
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [opt.title]: choice, // guardamos la opción seleccionada
                          }));
                        }}
                      />

                      <p>{choice.name} </p>
                    </div>

                    <p
                      className={`font-semibold px-2 py-1 rounded-[4px] flex items-center justify-center text-center text-[14px] bg-[var(--light-gray)] ${!choice.price ? "hidden" : ""}`}
                    >
                      {choice.price > 0 && `$${choice.price} MXN`}
                    </p>
                  </label>
                ))}

              {/* Checkbox */}
              {opt.type === "checkbox" &&
                opt.choices.map((choice, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-row gap-2">
                      <input
                        className="accent-[var(--accent-color)]"
                        type="checkbox"
                        name={opt.title}
                        value={choice.name}
                        disabled={
                          (selectedOptions[opt.title]?.length || 0) >=
                            opt.maxSelectable &&
                          !selectedOptions[opt.title]?.some(
                            (item) => item.name === choice.name,
                          )
                        }
                        onChange={(e) => {
                          setSelectedOptions((prev) => {
                            const current = prev[opt.title] || [];

                            if (e.target.checked) {
                              // 🚫 si ya llegó al límite, no agregar
                              if (current.length >= opt.maxSelectable) {
                                return prev;
                              }

                              return {
                                ...prev,
                                [opt.title]: [...current, choice],
                              };
                            } else {
                              return {
                                ...prev,
                                [opt.title]: current.filter(
                                  (item) => item.name !== choice.name,
                                ),
                              };
                            }
                          });
                        }}
                      />

                      {choice.name}
                    </div>

                    <p
                      className={`font-semibold px-2 py-1 rounded-[4px] flex items-center justify-center text-center text-[14px] bg-[var(--light-gray)] ${!choice.price ? "hidden" : ""}`}
                    >
                      {choice.price > 0 && `$${choice.price} MXN`}
                    </p>
                  </label>
                ))}

              {/* Addable (cantidad) */}
              {opt.type === "addable" &&
                opt.choices.map((choice, i) => {
                  const quantity =
                    selectedOptions?.[opt.title]?.[choice.name]?.quantity || 0;

                  const totalSelected = Object.values(
                    selectedOptions?.[opt.title] || {},
                  ).reduce((sum, item) => sum + (item.quantity || 0), 0);

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-row gap-2">
                        <p
                          className={`font-semibold px-2 py-1 rounded-[4px] flex items-center justify-center text-center text-[14px] bg-[var(--light-gray)] ${!choice.price ? "hidden" : ""}`}
                        >
                          {" "}
                          {choice.price > 0 && `$${choice.price} MXN`}
                        </p>
                        <p className="flex flex-row items-center">
                          {choice.name}{" "}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* BOTÓN - */}
                        <button
                          className="cursor-pointer px-2 bg-[var(--light-gray)] rounded"
                          onClick={() => {
                            setSelectedOptions((prev) => {
                              const current = prev[opt.title] || {};
                              const currentQty =
                                current[choice.name]?.quantity || 0;

                              const newQty = Math.max(0, currentQty - 1);

                              return {
                                ...prev,
                                [opt.title]: {
                                  ...current,
                                  [choice.name]: {
                                    ...choice,
                                    quantity: newQty,
                                  },
                                },
                              };
                            });
                          }}
                        >
                          -
                        </button>

                        <span>{quantity}</span>

                        {/* BOTÓN + */}
                        <button
                          className="cursor-pointer px-2 bg-[var(--light-gray)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={totalSelected >= opt.maxSelectable}
                          onClick={() => {
                            setSelectedOptions((prev) => {
                              const current = prev[opt.title] || {};
                              const currentQty =
                                current[choice.name]?.quantity || 0;

                              return {
                                ...prev,
                                [opt.title]: {
                                  ...current,
                                  [choice.name]: {
                                    ...choice,
                                    quantity: currentQty + 1,
                                  },
                                },
                              };
                            });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}

              {/* Texto */}
            </div>
          ))}
        </div>

        {/* Div cantidad y agregar al carrito */}
        <div className="p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] flex flex-col gap-2 items-center">
          <input
            type="text"
            placeholder="Nota adicional"
            className="w-full border rounded p-1 pl-2 outline-none focus:outline-none focus:ring-0 border-[var(--gray-color)] placeholder-[var(--gray-color)]"
          />

          {/* 

          <div className="flex items-center gap-2">
             
            <button
              className="cursor-pointer w-[35px] h-[35px] text-[18px] text-center flex flex-row items-center justify-center bg-[var(--light-gray)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>

            <span>{quantity}</span>

             <button
              className="cursor-pointer w-[35px] h-[35px] text-[18px] text-center flex flex-row items-center justify-center bg-[var(--light-gray)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={quantity >= max}
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>{" "}

           
          <p>{`Máximo ${max}`}</p>
          */}
          <button
            className="cursor-pointer bg-[var(--accent-color)] text-white p-2 rounded-[6px] w-full"
            onClick={() => {
              // 1. Validar TODO
              for (const opt of product.options || []) {
                if (opt.required && !selectedOptions[opt.title]) {
                  console.log(`ERROR: DEBES LLENAR EL CAMPO ${opt.title}`);
                  return;
                }
              }

              // 2. Calcular base correctamente
              const base =
                product.priceType === "dynamic"
                  ? Number(product.basePrice || 0)
                  : Number(product.price);

              // 3. Crear item (BIEN estructurado)
              const pedido = {
                id: generateId(),

                productId: product.id,
                restaurantId: product.restaurantId,

                name: product.name,
                image: product.image,

                quantity: quantity,

                basePrice: base,
                totalPrice: finalPrice,

                // 🔥 copiar opciones (evita bugs raros)
                options: JSON.parse(JSON.stringify(selectedOptions)),

                // (opcional si luego agregas estado)
                // note: note
              };

              // 4. Agregar al carrito
              addToCart(pedido);

              onClose();
            }}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
