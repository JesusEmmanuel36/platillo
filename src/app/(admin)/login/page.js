"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (data.reason === "not_superadmin") {
          setError("No tienes acceso a este panel.");
        } else {
          setError("Error al verificar sesión.");
        }
        await auth.signOut();
        return;
      }

      router.push("/");
    } catch (e) {
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
        setError("Email o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">Platillo</p>
          <p className="text-sm text-[var(--gray-color)] mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@platillo.mx"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--foreground)]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--red-text-color)] bg-[var(--red-color)] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent-color)] text-white font-semibold rounded-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}