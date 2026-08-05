"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

function LogoutIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

export default function PanelLogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/panel/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión");
      }

      await signOut(auth).catch(() => {});

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--accent-color)] px-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(237,64,11,0.24)] disabled:pointer-events-none disabled:opacity-60 sm:px-4"
    >
      <LogoutIcon className="h-4 w-4" />

      <span className="hidden sm:inline">
        {loading ? "Cerrando..." : "Cerrar sesión"}
      </span>
    </button>
  );
}