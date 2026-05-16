"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Menu, Building2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC closes drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh bg-[#faf7f1]">
      {/* ============ MOBILE TOP BAR ============ */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 safe-top">
        <div className="flex items-center justify-between gap-3 h-14 px-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 active:bg-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_4px_10px_rgba(161,98,7,0.35)]">
              <Building2 className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-slate-900 truncate">
              Villa Management
            </span>
          </div>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      {/* ============ MOBILE DRAWER ============ */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] animate-overlay-in"
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] animate-slide-in-left shadow-deep">
            <Sidebar onClose={() => setOpen(false)} mobileMode />
          </aside>
        </>
      )}

      {/* ============ DESKTOP SHELL ============
          Mobile: block layout (no flex toggle).
          Desktop (lg+): flex row, sidebar fixed-width on left, main scrolls.
          No `flex-col → lg:flex-row` toggle — direction is never inverted. */}
      <div className="lg:flex lg:h-dvh lg:overflow-hidden">
        {/* Desktop sidebar — fixed width 260px, full viewport height */}
        <aside className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:h-dvh">
          <Sidebar />
        </aside>

        {/* Main content — fills remaining width on desktop, scrolls inside */}
        <main className="lg:flex-1 lg:min-w-0 lg:h-dvh lg:overflow-y-auto bg-[#faf7f1]">
          {children}
        </main>
      </div>
    </div>
  );
}
