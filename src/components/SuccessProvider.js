"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const SuccessContext = createContext(null);

export function SuccessProvider({ children }) {
  const [success, setSuccess] = useState(null);
  const timeoutRef = useRef(null);

  const closeSuccess = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSuccess(null);
  }, []);

  const showSuccess = useCallback(
    ({
      title = "Listo",
      message = "Acción realizada correctamente.",
      duration = 3000,
      showCloseButton = false,
      closeText = "Cerrar",
    }) => {
      // Si ya hay un success abierto, lo reemplaza y reinicia el timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setSuccess({
        title,
        message,
        showCloseButton,
        closeText,
      });

      // Si duration es null, false o 0, no se cierra solo
      if (duration) {
        timeoutRef.current = setTimeout(() => {
          setSuccess(null);
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
    <SuccessContext.Provider value={{ showSuccess, closeSuccess }}>
      {children}

      {success && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-[340px] rounded-[12px] border border-[var(--green-text-color)] bg-[var(--green-color)] p-5 text-center text-[var(--green-text-color)] shadow-xl">
            <p className="text-[18px] font-semibold">{success.title}</p>

            <p className="mt-2 text-[15px] leading-5">{success.message}</p>

            {success.showCloseButton && (
              <button
                type="button"
                onClick={closeSuccess}
                className="mt-5 w-full rounded-[10px] bg-[var(--green-text-color)] px-4 py-2.5 text-[14px] font-bold text-white transition-all active:scale-[0.98]"
              >
                {success.closeText}
              </button>
            )}
          </div>
        </div>
      )}
    </SuccessContext.Provider>
  );
}

export function useSuccess() {
  const context = useContext(SuccessContext);

  if (!context) {
    throw new Error("useSuccess debe usarse dentro de SuccessProvider");
  }

  return context;
}