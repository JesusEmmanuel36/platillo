"use client";

import { usePathname } from "next/navigation";

export default function SlugLayout({ children }) {
  const pathname = usePathname();

  const isCheckout = pathname.includes("checkout");

  return <>{children}</>;
}