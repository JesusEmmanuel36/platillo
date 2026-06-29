"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const closeError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setError(null);
  }, []);

  const showError = useCallback(
    ({
      title = "Ocurrió un error",
      message = "Inténtalo de nuevo.",
      duration = 3000,
      showCloseButton = false,
      closeText = "Cerrar",
    }) => {
      // Si ya hay un error abierto, no crea otro.
      // Solo reemplaza el contenido y reinicia el timer.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setError({
        title,
        message,
        showCloseButton,
        closeText,
      });

      // Si duration es null, false o 0, NO se cierra solo
      if (duration) {
        timeoutRef.current = setTimeout(() => {
          setError(null);
          timeoutRef.current = null;
        }, duration);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, closeError }}>
      {children}

      {error && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-[300px] rounded-[12px] border border-[var(--red-text-color)] bg-[var(--red-color)] p-5 text-center text-[var(--red-text-color)] shadow-xl">
            <p className="text-[18px] font-semibold">{error.title}</p>

            <p className="mt-2 text-[15px] leading-5">{error.message}</p>

            {error.showCloseButton && (
              <button
                type="button"
                onClick={closeError}
                className="mt-5 w-full rounded-[10px] bg-[var(--red-text-color)] px-4 py-2.5 text-[14px] font-bold text-white transition-all active:scale-[0.98]"
              >
                {error.closeText}
              </button>
            )}
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error("useError debe usarse dentro de ErrorProvider");
  }

  return context;
}