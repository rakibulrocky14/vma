"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[60] flex flex-col gap-2 pointer-events-none px-4 sm:px-0"
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          right: "max(0px, env(safe-area-inset-right))",
          left: "max(0px, env(safe-area-inset-left))",
        }}
      >
        <div className="ml-auto sm:mr-4 flex flex-col gap-2 w-full sm:w-auto sm:max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-[13.5px] font-medium shadow-elevated animate-slide-up",
                t.type === "success"
                  ? "bg-slate-900 text-white ring-1 ring-emerald-500/30"
                  : "bg-red-700 text-white"
              )}
            >
              {t.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss"
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
