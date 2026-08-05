"use client";

export default function RestaurantLogin() {
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

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="restaurante@correo.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--half-gray)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--accent-color)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent-color)] text-white font-semibold rounded-lg cursor-pointer"
          >
            Entrar al panel
          </button>
        </form>
      </div>
    </div>
  );
}