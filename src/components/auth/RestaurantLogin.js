"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function RestaurantLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(event) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Ingresa tu email y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Iniciar sesión con Firebase Authentication.
      const credential =
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

      // 2. Obtener el token firmado de Firebase.
      const token =
        await credential.user.getIdToken(true);

      // 3. Enviarlo al servidor para verificar el restaurante
      // y crear la cookie panel_token.
      const response = await fetch("/api/panel/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.reason === "restaurant_not_found") {
          setError(
            "No se encontró un restaurante asociado a esta cuenta",
          );
        } else if (
          data.reason === "restaurant_suspended"
        ) {
          setError(
            "El acceso de este restaurante está suspendido",
          );
        } else {
          setError(
            "No se pudo verificar la sesión",
          );
        }

        await signOut(auth);
        return;
      }

      // 4. La cookie ya fue creada por el servidor.
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Error iniciando sesión en el panel:",
        error,
      );

      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/user-not-found"
      ) {
        setError("Email o contraseña incorrectos");
      } else if (
        error?.code === "auth/too-many-requests"
      ) {
        setError(
          "Demasiados intentos. Espera unos minutos e inténtalo nuevamente",
        );
      } else if (
        error?.code === "auth/network-request-failed"
      ) {
        setError(
          "No se pudo conectar. Revisa tu conexión a internet",
        );
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Platillo"
            className="w-[110px] h-auto object-contain"
          />

          <div className="mt-1"> 

            <p className="text-sm text-[var(--gray-color)] mt-1">
              Accede al panel de tu restaurante
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="restaurant-email"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Correo electrónico
            </label>

            <input
              id="restaurant-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="restaurante@correo.com"
              autoComplete="email"
              autoCapitalize="none"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)] disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="restaurant-password"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Contraseña
            </label>

            <input
              id="restaurant-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)] disabled:opacity-60"
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
            className="w-full py-3 bg-[var(--accent-color)] text-white font-semibold rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Entrando..."
              : "Entrar al panel"}
          </button>
        </form>
      </div>
    </div>
  );
}