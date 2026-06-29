"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import dynamic from "next/dynamic";
import { getProducts } from "@/lib/firestore";
import ProductOptionsModal from "./ProductModal";
import Navbar from "./Navbar";
import { useSuccess } from "@/components/SuccessProvider";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

function estaDentroDelHorario(restaurant) {
  if (!restaurant?.isOpen) return false;
  if (restaurant?.alwaysOpen) return true;

  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const ahora = new Date();
  const diaActual = dias[ahora.getDay()];

  const horarioHoy = restaurant.horarios?.find((h) => h.dia === diaActual);

  if (!horarioHoy || !horarioHoy.abierto) return false;

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  const [apH, apM] = horarioHoy.apertura.split(":").map(Number);

  const [ciH, ciM] = horarioHoy.cierre.split(":").map(Number);

  const minutosApertura = apH * 60 + apM;
  const minutosCierre = ciH * 60 + ciM;

  return minutosAhora >= minutosApertura && minutosAhora <= minutosCierre;
}

function a12h(hora24) {
  const [h, m] = hora24.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function RestaurantPage({ restaurant, products }) {
  const [locationDivOpen, setLocationDivOpen] = useState(false);
  const [OpeningDivOpen, setOpeningDivOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const restauranteDisponible = estaDentroDelHorario(restaurant);
  const { showSuccess } = useSuccess();

  const categories = [...new Set(products.map((p) => p.category))];

  const initialOpenState = {};
  categories.forEach((c) => (initialOpenState[c] = true));

  const [openCategories, setOpenCategories] = useState(initialOpenState);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    if (restaurant?.accent_color) {
      document.documentElement.style.setProperty(
        "--accent-color",
        restaurant.accent_color,
      );
    }
    if (restaurant?.light_accent) {
      document.documentElement.style.setProperty(
        "--light-accent",
        restaurant.light_accent,
      );
    }
    if (restaurant?.pfp) {
      const link =
        document.querySelector("link[rel='icon']") ||
        document.createElement("link");
      link.rel = "icon";
      link.href = restaurant.pfp;
      document.head.appendChild(link);
    }
    if (restaurant?.name) {
      document.title = restaurant.name;
    }
  }, []);

  return (
    <div className="relative max-w-[420px] mx-auto bg-black h-[100dvh] flex flex-col">
      {/* Imagen */}
      <div className="h-[250px] w-full overflow-hidden">
        <img src={restaurant.banner} className="w-full h-full object-cover" />
      </div>

      {/* Contenido blanco */}
      <div className="absolute top-[200px] w-full min-h-[calc(100dvh-200px)] bg-white rounded-t-[20px] z-10 flex flex-col gap-3 p-3 pb-[calc(100px+env(safe-area-inset-bottom))]">
        {/* DIV CONTENEDOR BLANCO*/}
        <div className="flex flex-row justify-between items-center">
          {/* DIV STATUS Y REDES */}
          <div
            className={`flex flex-row justify-between items-center rounded-[10px] text-[14px] px-3 py-1 gap-2 ${restauranteDisponible ? " bg-[var(--green-color)] text-[var(--green-text-color)]" : "bg-[var(--red-color)] text-[var(--red-text-color)]"} `}
          >
            <div
              className={`w-[8px] h-[8px] rounded-[100px] ${restauranteDisponible ? "bg-[var(--green-text-color)]" : "bg-[var(--red-text-color)]"} `}
            ></div>
            {restauranteDisponible ? "Abierto" : "Cerrado"}
          </div>
          <div className="flex gap-3">
            {/* SVG UBICACION */}

            <svg
              onClick={() => setLocationDivOpen(true)}
              className="w-9 h-9 bg-[var(--light-gray)] rounded-[9px] p-[7px] cursor-pointer"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* SVG HORARIOS */}

            <svg
              onClick={() => setOpeningDivOpen(true)}
              className="w-9 h-9 bg-[var(--light-gray)] rounded-[9px] p-[7px] cursor-pointer"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* SVG INSTAGRAM */}

            {restaurant.instagram && (
              <svg
                onClick={() => {
                  window.location.href = restaurant.instagram;
                }}
                className="w-9 h-9 bg-[var(--light-gray)] rounded-[9px] p-[5px] cursor-pointer"
                fill="#000000"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.445 5h-8.891A6.559 6.559 0 0 0 5 11.554v8.891A6.559 6.559 0 0 0 11.554 27h8.891a6.56 6.56 0 0 0 6.554-6.555v-8.891A6.557 6.557 0 0 0 20.445 5zm4.342 15.445a4.343 4.343 0 0 1-4.342 4.342h-8.891a4.341 4.341 0 0 1-4.341-4.342v-8.891a4.34 4.34 0 0 1 4.341-4.341h8.891a4.342 4.342 0 0 1 4.341 4.341l.001 8.891z" />
                <path d="M16 10.312c-3.138 0-5.688 2.551-5.688 5.688s2.551 5.688 5.688 5.688 5.688-2.551 5.688-5.688-2.55-5.688-5.688-5.688zm0 9.163a3.475 3.475 0 1 1-.001-6.95 3.475 3.475 0 0 1 .001 6.95zM21.7 8.991a1.363 1.363 0 1 1-1.364 1.364c0-.752.51-1.364 1.364-1.364z" />
              </svg>
            )}

            {/* SVG FACEBOOK */}

            {restaurant.facebook && (
              <svg
                onClick={() => {
                  window.location.href = restaurant.facebook;
                }}
                className="w-9 h-9 bg-[var(--light-gray)] rounded-[9px] p-[5px] cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 12.05C19.9813 10.5255 19.5273 9.03809 18.6915 7.76295C17.8557 6.48781 16.673 5.47804 15.2826 4.85257C13.8921 4.2271 12.3519 4.01198 10.8433 4.23253C9.33473 4.45309 7.92057 5.10013 6.7674 6.09748C5.61422 7.09482 4.77005 8.40092 4.3343 9.86195C3.89856 11.323 3.88938 12.8781 4.30786 14.3442C4.72634 15.8103 5.55504 17.1262 6.69637 18.1371C7.83769 19.148 9.24412 19.8117 10.75 20.05V14.38H8.75001V12.05H10.75V10.28C10.7037 9.86846 10.7483 9.45175 10.8807 9.05931C11.0131 8.66687 11.23 8.30827 11.5161 8.00882C11.8022 7.70936 12.1505 7.47635 12.5365 7.32624C12.9225 7.17612 13.3368 7.11255 13.75 7.14003C14.3498 7.14824 14.9482 7.20173 15.54 7.30003V9.30003H14.54C14.3676 9.27828 14.1924 9.29556 14.0276 9.35059C13.8627 9.40562 13.7123 9.49699 13.5875 9.61795C13.4627 9.73891 13.3667 9.88637 13.3066 10.0494C13.2464 10.2125 13.2237 10.387 13.24 10.56V12.07H15.46L15.1 14.4H13.25V20C15.1399 19.7011 16.8601 18.7347 18.0985 17.2761C19.3369 15.8175 20.0115 13.9634 20 12.05Z"
                  fill="#000000"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-3 w-full">
          <img
            className="w-[70px] h-[70px] rounded-[10px]"
            src={restaurant.pfp}
          ></img>

          <div className="flex flex-col w-full gap-1 justify-center">
            <h1>{restaurant.name}</h1>
            <p className="text-[15px] text-[var(--gray-color)]">
              {restaurant.address}
            </p>
          </div>
        </div>

        {!restauranteDisponible && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center px-6">
            <div className="bg-[var(--red-color)] text-[var(--red-text-color)] border border-[var(--red-text-color)] rounded-[12px] p-5 max-w-[320px] text-center shadow-xl">
              <p className="font-semibold text-[18px]">Restaurante cerrado</p>

              <p className="mt-2">
                Este restaurante se encuentra cerrado en este momento.
              </p>
            </div>
          </div>
        )}

        {categories.map((category, index) => {
          const productsByCategory = products.filter(
            (p) => p.category === category,
          );
          const count = productsByCategory.length;
          const isOpen = openCategories[category] || false;

          return (
            <section
              key={index}
              className={`bg-white w-full h-auto flex flex-col duration-500 ${isOpen ? "gap-3" : "gap-0"}`}
            >
              {/* Header de categoría */}
              <div
                className="flex flex-row bg-[var(--accent-color)] p-2 rounded-[7px] justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex gap-2 text-white text-[15px] font-[600]">
                  {category}
                  <div className="px-[13px] py-0 text-[15px]  flex items-center justify-center rounded-md bg-[var(--light-accent)] text-[var(--accent-color)] font-bold">
                    {count}
                  </div>
                </div>

                <svg
                  className={`w-7 h-7 m-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  height="48px"
                  viewBox="0 -960 960 960"
                  width="48px"
                  fill="#e3e3e3"
                >
                  <path d="M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z" />
                </svg>
              </div>

              {/* Grid de productos */}
              <div
                className={`flex flex-col gap-3 transition-all duration-300 ${
                  isOpen ? "max-h-[2000px]" : "overflow-hidden max-h-0"
                }`}
              >
                {productsByCategory.map((product, i) => (
                  <ProductCard
                    key={i}
                    name={product.name}
                    price={product.price}
                    stock={product.stock}
                    description={product.description}
                    image={product.image}
                    category={product.category}
                    priceType={product.priceType}
                    restaurantOpen={restauranteDisponible}
                    onAdd={() => {
                      if (!restauranteDisponible) return;
                      setSelectedProduct(product);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* DIV UBICACION */}

      {locationDivOpen && (
        <div className="absolute fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
          {/* CONTENIDO */}
          <div className="relative bg-white rounded-[10px] p-6 flex flex-col gap-2 max-w-[300px] max-h-[300px] items-center justify-center">
            <h2 className="text-black font-semibold text-[20px] text-center">
              Ubicación
            </h2>
            <p className="text-center">{restaurant.address}</p>

            {restaurant?.pfp && (
              <Map location={restaurant.location} pfp={restaurant.pfp} />
            )}

            <button
              className="absolute flex flex-col items-center justify-center cursor-pointer top-6 right-6 w-7 h-7 text-white rounded-[6px] bg-[var(--accent-color)]"
              onClick={() => setLocationDivOpen(false)}
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
        </div>
      )}

      {/* DIV HORARIOS */}

      {OpeningDivOpen && (
        <div className="absolute fixed inset-0 bg-black/50 z-60 flex items-center justify-center">
          {/* CONTENIDO */}
          <div className="relative bg-white rounded-[10px] p-6 flex flex-col gap-2  items-center justify-center">
            <h2 className="text-black font-semibold text-[20px] text-center">
              Horario
            </h2>

            <div className="w-auto h-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[var(--light-gray)] border-b">
                  <tr>
                    <th className="px-4 py-1">Día</th>
                    <th className="px-4 py-1">Apertura</th>
                    <th className="px-4 py-1">Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurant.alwaysOpen ? (
                    // Solo una fila, una celda que ocupa las 3 columnas
                    <tr className="hover:bg-gray-50">
                      <td
                        className="px-4 py-2 font-semibold text-center"
                        colSpan={3} // ocupa las 3 columnas
                      >
                        Abierto 24 horas
                      </td>
                    </tr>
                  ) : (
                    //  Mostrar horarios normales
                    restaurant.horarios.map((h, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-1">{h.dia}</td>

                        <td className="px-4 py-1 font-semibold">
                          {h.abierto ? a12h(h.apertura) : "Cerrado"}
                        </td>

                        <td className="px-4 py-1 font-semibold">
                          {h.abierto ? a12h(h.cierre) : "Cerrado"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              className="absolute flex flex-col items-center justify-center cursor-pointer top-6 right-6 w-7 h-7 text-white rounded-[6px] bg-[var(--accent-color)]"
              onClick={() => setOpeningDivOpen(false)}
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
        </div>
      )}

      <Navbar restaurantOpen={restauranteDisponible} slug={restaurant.slug} />
      {/* DIV MODAL PRODUCT OPTIONS*/}

      {selectedProduct && (
        <ProductOptionsModal
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
          }}
          onAdded={() => {
            showSuccess({
              title: "Producto agregado",
              message: "Puedes revisar tu pedido en el carrito.",
              duration: 1000,
            });
          }}
        />
      )}
    </div>
  );
}
