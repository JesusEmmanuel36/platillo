"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-4 py-2 rounded-lg bg-[var(--light-gray)] text-[var(--foreground)] hover:bg-[var(--half-gray)] transition-colors cursor-pointer"
    >
      Cerrar sesión
    </button>
  );
}