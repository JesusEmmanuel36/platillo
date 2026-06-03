"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/useCartStore";

export default function CartProvider({ children }) {
  const setCart = useCartStore((state) => state.setCart);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  return <>{children}</>
}