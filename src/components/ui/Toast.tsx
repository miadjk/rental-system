"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface ToastItem {
  id: string;
  message: string;
  kind: "success" | "error" | "info";
}

const ToastContext = createContext<{ notify: (message: string, kind?: ToastItem["kind"]) => void }>({
  notify: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, kind: ToastItem["kind"] = "success") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up pointer-events-auto w-full rounded-xl border px-4 py-3 text-sm shadow-sm backdrop-blur ${
              t.kind === "success"
                ? "border-[#CCBEB1] bg-white text-[#664930]"
                : t.kind === "error"
                  ? "border-red-200 bg-white text-red-700"
                  : "border-[#CCBEB1] bg-white text-[#664930]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  t.kind === "success" ? "bg-green-500" : t.kind === "error" ? "bg-red-500" : "bg-[#997E67]"
                }`}
              />
              <span className="font-medium">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
