"use client";

import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/shareholders", icon: Users, label: "Shareholders" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  onClose?: () => void;
  mobileMode?: boolean;
}

export function Sidebar({ onClose, mobileMode = false }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  function isActive(href: string) {
    if (href === "/dashboard")
      return pathname === "/dashboard" || pathname.startsWith("/villas");
    return pathname.startsWith(href);
  }

  const userName = session?.user?.name ?? "Account";
  const userEmail = session?.user?.email ?? "";
  const userRole = session?.user?.role as string | undefined;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col bg-ink-rich text-white overflow-hidden",
        mobileMode ? "w-full" : "w-[260px]"
      )}
    >
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-10 h-60 w-60 rounded-full bg-amber-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-40 -right-16 h-72 w-72 rounded-full bg-blue-900/40 blur-3xl" />

      {/* Brand */}
      <div
        className="relative z-10 px-5 pb-5 border-b border-white/[0.06]"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_8px_20px_rgba(161,98,7,0.45)]">
                <Building2 className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[15px] font-bold tracking-tight text-white leading-tight truncate">
                Villa Management
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/90 mt-0.5">
                Doha · Qatar
              </p>
            </div>
          </div>
          {mobileMode && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/[0.06] hover:text-white active:bg-white/[0.12] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Workspace
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-medium",
                    "transition-all duration-200 min-h-[44px]",
                    active
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.08]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                  )}
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-all",
                      active
                        ? "text-amber-400"
                        : "text-slate-500 group-hover:text-slate-200"
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={active ? "font-semibold" : ""}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin section */}
        {userRole === "ADMIN" && (
          <>
            <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Administration
            </p>
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href="/users"
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-medium",
                    "transition-all duration-200 min-h-[44px]",
                    pathname.startsWith("/users")
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white active:bg-white/[0.08]"
                  )}
                >
                  {pathname.startsWith("/users") && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                  )}
                  <UserCog
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-all",
                      pathname.startsWith("/users")
                        ? "text-amber-400"
                        : "text-slate-500 group-hover:text-slate-200"
                    )}
                    strokeWidth={pathname.startsWith("/users") ? 2.5 : 2}
                  />
                  <span className={pathname.startsWith("/users") ? "font-semibold" : ""}>Users</span>
                </Link>
              </li>
            </ul>
          </>
        )}

        {/* Promo card */}
        <div className="mt-6 mx-1 rounded-xl border border-white/[0.06] bg-gradient-to-br from-amber-950/40 to-amber-900/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">
            Quick tip
          </p>
          <p className="mt-1.5 text-[12.5px] text-slate-300 leading-relaxed">
            Use the month picker on any villa to navigate past months and review historical data.
          </p>
        </div>
      </nav>

      {/* User */}
      <div className="relative z-10 border-t border-white/[0.06] p-3 pb-safe">
        <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-white/[0.04] transition-colors">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-[14px] font-bold text-white shadow-md">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white leading-tight">
              {userName}
            </p>
            <p className="truncate text-[11px] text-slate-400 mt-0.5">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-amber-400 active:bg-white/[0.12] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
