"use client";

import { useCartStore } from "@/stores/useCartStore";
import { useRouter, useParams } from "next/navigation";

export default function Cart({ onClose }) {
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const { slug } = useParams(); // 👈 aquí defines slug

  const handleCheckout = () => {
    router.push(`/${slug}/checkout`);
    onClose(); // 👈 cierras el carrito
  };

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

  return (
    <div className="absolute fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
      <div className="p-4 flex flex-col gap-2 fixed inset-x-0 mx-auto w-full max-w-[320px] h-[400px]  left-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)]  text-black z-10 rounded-[10px]">
        <div className="w-full flex flex-row  text-black items-center justify-center">
          <h2 className="font-semibold">Carrito</h2>
        </div>

        <button
          onClick={onClose}
          className="absolute flex flex-col items-center justify-center cursor-pointer top-4 right-4 w-7 h-7 text-white rounded-[6px] bg-[var(--accent-color)]"
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

        {cart.length > 0 ? (
          <>
            <div className="text-white w-full  max-h-[300px] h-full  overflow-y-auto gap-2 flex flex-col">
              {cart.map((item, i) => {
                const optionsText = optionsToString(item.options);

                return (
                  <div
                    key={i}
                    className="w-full flex flex-row gap-2 items-center"
                  >
                    <div className="bg-black w-20 max-h-20 aspect-square overflow-hidden rounded-sm flex items-center justify-center">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex flex-col gap-1 text-black">
                      <p className="break-all text-[16px]">{item.name}</p>

                      {/* 👇 AQUÍ */}
                      {optionsText && (
                        <p className="text-[12px] text-gray-500 break-words max-w-[230px]">
                          {optionsText}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        {/* BOTÓN - */}
                        <button
                          className="px-2 bg-[var(--light-gray)] rounded  cursor-pointer"
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeFromCart(i);
                            } else {
                              updateCartItem(i, {
                                ...item,
                                quantity: item.quantity - 1,
                              });
                            }
                          }}
                        >
                          -
                        </button>

                        <span className="text-sm">{item.quantity}</span>

                        {/* BOTÓN + */}
                        <button
                          className="px-2 bg-[var(--light-gray)] rounded cursor-pointer"
                          onClick={() => {
                            updateCartItem(i, {
                              ...item,
                              quantity: item.quantity + 1,
                            });
                          }}
                        >
                          +
                        </button>

                        <p className="relative left-14 text-[14px]">
                          ${item.totalPrice} MXN
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-end font-semibold">
              Total: $
              {cart.reduce((acc, item) => {
                return acc + item.totalPrice * item.quantity;
              }, 0)}{" "}
              MXN
            </p>
            <button
              onClick={() => {
                const pedido = {
                  restaurantId: cart[0]?.restaurantId,

                  items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    options: item.options,
                    note: item.note || null,
                  })),

                  total: cart.reduce((acc, item) => {
                    return acc + item.totalPrice * item.quantity;
                  }, 0),
                };

                handleCheckout();
                console.log(pedido);
              }}
              className="cursor-pointer bg-[var(--accent-color)] text-white p-2 rounded-[6px] w-full"
            >
              Continuar
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center text-center h-full">
            <p className="mb-20">No hay nada en el carrito.</p>
          </div>
        )}
      </div>
    </div>
  );
}
