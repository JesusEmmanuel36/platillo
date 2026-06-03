"use client";

import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],

  // Cargar carrito
  setCart: (cart) => set({ cart }),

  // Agregar producto
  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (i) =>
          i.ProductoId === item.ProductoId &&
          JSON.stringify(i.options) === JSON.stringify(item.options),
      );

      let newCart;

      if (existingIndex !== -1) {
        newCart = [...state.cart];
        newCart[existingIndex].quantity += 1;
      } else {
        newCart = [...state.cart, { ...item, quantity: 1 }];
      }

      localStorage.setItem("cart", JSON.stringify(newCart));

      return { cart: newCart };
    }),

  // Actualizar producto
  updateCartItem: (index, updatedItem) =>
    set((state) => {
      const newCart = [...state.cart];

      newCart[index] = updatedItem;

      localStorage.setItem("cart", JSON.stringify(newCart));

      return { cart: newCart };
    }),

  // Eliminar por índice
  removeFromCart: (index) =>
    set((state) => {
      const newCart = state.cart.filter((_, i) => i !== index);

      localStorage.setItem("cart", JSON.stringify(newCart));

      return { cart: newCart };
    }),

  // Vaciar carrito
  clearCart: () => {
    localStorage.removeItem("cart");
    set({ cart: [] });
  },
}));
