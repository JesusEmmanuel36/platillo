 "use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function SlugLayout({ children }) {
  const pathname = usePathname();

  const isCheckout = pathname.includes("checkout");

  return (
    <>
      {!isCheckout && <Navbar />}
      {children}
    </>
  );
}