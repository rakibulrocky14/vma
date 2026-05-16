"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatQAR, parseDecimal } from "@/lib/currency";
import {
  Building2,
  Plus,
  DoorOpen,
  Users,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface DashRoom {
  records?: { rentAmount: unknown; paidAmount: unknown }[];
}
interface DashVilla {
  id: string;
  villaNumber: string;
  address: string;
  totalRooms: number;
  rooms?: DashRoom[];
  shareholders?: { shareholder: { name: string } }[];
}

function getStats(villa: DashVilla) {
  let totalRent = 0;
  let totalCollected = 0;
  for (const room of villa.rooms ?? []) {
    const record = room.records?.[0];
    if (record) {
      totalRent += parseDecimal(record.rentAmount);
      totalCollected += parseDecimal(record.paidAmount);
    }
  }
  return { totalRent, totalCollected };
}

export default function DashboardPage() {
  const { data: villas, isLoading } = useQuery<DashVilla[]>({
    queryKey: ["villas"],
    queryFn: async () => {
      const res = await fetch("/api/villas");
      if (!res.ok) throw new Error("Failed to load villas");
      return res.json();
    },
  });

  if (isLoading) return <PageSpinner />;

  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy");
  const list = villas ?? [];

  const totals = list.reduce(
    (acc, v) => {
      const s = getStats(v);
      return {
        rent: acc.rent + s.totalRent,
        collected: acc.collected + s.totalCollected,
        rooms: acc.rooms + (v.totalRooms ?? 0),
      };
    },
    { rent: 0, collected: 0, rooms: 0 }
  );
  const outstanding = totals.rent - totals.collected;
  const overallPct = totals.rent > 0 ? Math.round((totals.collected / totals.rent) * 100) : 0;

  return (
    <div className="min-h-full">
      <div className="px-4 sm:px-8 lg:px-12 py-6 sm:py-10 max-w-[1400px] mx-auto">
        {/* Editorial header */}
        <header className="mb-7 sm:mb-10">
          <div className="flex items-start sm:items-end justify-between gap-3 sm:gap-6 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <span className="h-px w-6 sm:w-8 bg-amber-700" />
                <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
                  {monthLabel}
                </p>
              </div>
              <h1 className="font-display text-[34px] sm:text-[48px] lg:text-[64px] leading-[0.95] font-black tracking-[-0.03em] text-slate-950">
                Good {timeOfDay()}<span className="text-amber-700">.</span>
              </h1>
              <p className="mt-2 sm:mt-3 text-[13.5px] sm:text-[15px] text-slate-600 max-w-xl">
                You&apos;re managing <span className="font-semibold text-slate-900">{list.length}</span>{" "}
                {list.length === 1 ? "villa" : "villas"} across{" "}
                <span className="font-semibold text-slate-900">{totals.rooms}</span> rooms this month.
              </p>
            </div>
            <Link href="/villas/new" className="shrink-0">
              <Button size="lg" variant="primary">
                <Plus className="h-4 w-4" />
                <span>New villa</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {/* Big Collected hero */}
          <article className="col-span-12 md:col-span-7 lg:col-span-5 relative overflow-hidden rounded-2xl bg-ink-rich text-white shadow-elevated p-5 sm:p-7">
            <div className="absolute inset-0 bg-gold-glow opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10.5px] uppercase tracking-[0.2em] font-bold text-amber-300">
                  Collected this month
                </span>
              </div>

              <p className="font-display text-[40px] sm:text-[48px] lg:text-[56px] leading-none font-black tracking-tight text-white tabular-nums break-words">
                {formatQAR(totals.collected)}
              </p>

              <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-slate-300">
                of <span className="font-mono text-white">{formatQAR(totals.rent)}</span> expected
                {overallPct > 0 && (
                  <span className="ml-1 text-amber-300">· {overallPct}%</span>
                )}
              </p>

              {/* Progress */}
              <div className="mt-5 sm:mt-6">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700"
                    style={{ width: `${Math.min(overallPct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[11.5px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {list.filter((v) => getStats(v).totalRent > 0).length} active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  {list.filter((v) => getStats(v).totalRent === 0).length} no data
                </span>
              </div>
            </div>
          </article>

          {/* Outstanding */}
          <article className="col-span-12 sm:col-span-7 md:col-span-5 lg:col-span-4 relative overflow-hidden rounded-2xl bg-white shadow-card p-5 sm:p-6 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10.5px] uppercase tracking-[0.2em] font-bold text-slate-500">
                Outstanding
              </span>
            </div>
            <p
              className={
                "font-display text-[32px] sm:text-[40px] lg:text-[44px] leading-none font-black tracking-tight tabular-nums break-words " +
                (outstanding > 0 ? "text-amber-800" : "text-slate-300")
              }
            >
              {formatQAR(outstanding)}
            </p>
            <p className="mt-2 text-[12.5px] sm:text-[13px] text-slate-500">
              {outstanding > 0
                ? "Pending collection across all rooms"
                : "All rents collected — well done"}
            </p>

            {outstanding > 0 && (
              <div className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold ring-1 ring-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                {100 - overallPct}% remaining
              </div>
            )}
          </article>

          {/* Portfolio */}
          <article className="col-span-12 sm:col-span-5 md:col-span-12 lg:col-span-3 relative overflow-hidden rounded-2xl bg-paper-grain border border-slate-200/60 shadow-card p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10.5px] uppercase tracking-[0.2em] font-bold text-slate-500">
                Portfolio
              </span>
            </div>
            <p className="font-display text-[32px] sm:text-[40px] lg:text-[44px] leading-none font-black tracking-tight text-slate-900 tabular-nums">
              {list.length}
            </p>
            <p className="mt-2 text-[12.5px] sm:text-[13px] text-slate-500">
              {list.length === 1 ? "Villa" : "Villas"} · {totals.rooms} rooms
            </p>
            <div className="mt-auto pt-4">
              <Link
                href="/villas/new"
                className="inline-flex items-center gap-1 text-[12px] sm:text-[12.5px] font-semibold text-amber-800 hover:text-amber-900 min-h-[36px]"
              >
                Add property
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        </div>

        {/* Properties */}
        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 gap-3">
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-[0.22em] font-bold text-amber-800 mb-1 sm:mb-1.5">
                Your Portfolio
              </p>
              <h2 className="font-display text-[22px] sm:text-[28px] font-bold tracking-tight text-slate-950">
                Properties
              </h2>
            </div>
            <span className="text-[11.5px] sm:text-[12.5px] text-slate-500 font-mono shrink-0">
              {list.length.toString().padStart(2, "0")} total
            </span>
          </div>

          {/* Empty state */}
          {list.length === 0 && (
            <div className="relative overflow-hidden text-center py-16 sm:py-24 rounded-2xl border border-dashed border-slate-300 bg-white">
              <div className="absolute inset-0 bg-dot-grid opacity-50" />
              <div className="relative px-4">
                <div className="mx-auto mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_8px_24px_rgba(161,98,7,0.3)]">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-display text-[20px] sm:text-[24px] font-bold text-slate-950">
                  Start your portfolio
                </h3>
                <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 mb-5 sm:mb-6 max-w-sm mx-auto">
                  Add your first villa to start tracking rent collection, expenses, and shareholder distributions.
                </p>
                <Link href="/villas/new">
                  <Button size="lg">
                    <Plus className="h-4 w-4" />
                    Create your first villa
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Villa grid */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((villa) => {
              const { totalRent, totalCollected } = getStats(villa);
              const pct = totalRent > 0 ? Math.round((totalCollected / totalRent) * 100) : 0;
              const shareholderCount = villa.shareholders?.length ?? 0;
              const status =
                totalRent === 0
                  ? "empty"
                  : pct >= 100
                  ? "paid"
                  : pct >= 50
                  ? "partial"
                  : "behind";

              const villaNum = villa.villaNumber.replace(/^V-?/i, "").slice(0, 3) || "V";

              return (
                <Link key={villa.id} href={`/villas/${villa.id}`} className="group">
                  <article className="relative overflow-hidden h-full rounded-2xl bg-white border border-slate-200/60 shadow-card hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
                    {/* Status indicator strip */}
                    <div
                      className={
                        "absolute top-0 left-0 right-0 h-1 " +
                        (status === "paid"
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          : status === "partial"
                          ? "bg-gradient-to-r from-amber-400 to-amber-600"
                          : status === "behind"
                          ? "bg-gradient-to-r from-red-400 to-red-600"
                          : "bg-slate-200")
                      }
                    />

                    {/* Header band */}
                    <div className="relative p-4 sm:p-5 pb-3 sm:pb-4">
                      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-display font-black text-[14px] sm:text-[15px] shadow-md">
                            {villaNum}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[16px] sm:text-[17px] font-bold tracking-tight text-slate-950 truncate">
                              {villa.villaNumber}
                            </p>
                            <p className="text-[11px] sm:text-[11.5px] text-slate-500 truncate">
                              {villa.address}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-amber-700 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      {/* Big number */}
                      <div className="mb-3">
                        <p className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-slate-400 mb-1">
                          Collected
                        </p>
                        <p className="font-display text-[24px] sm:text-[26px] font-bold tracking-tight tabular-nums text-emerald-700 break-words">
                          {formatQAR(totalCollected)}
                        </p>
                        <p className="text-[11px] sm:text-[11.5px] text-slate-500 tabular-nums mt-0.5">
                          of {formatQAR(totalRent)}
                        </p>
                      </div>

                      {/* Progress + chip */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={
                              "h-full rounded-full transition-all duration-500 " +
                              (status === "paid"
                                ? "bg-emerald-500"
                                : status === "partial"
                                ? "bg-amber-500"
                                : status === "behind"
                                ? "bg-red-500"
                                : "bg-slate-300")
                            }
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span
                          className={
                            "text-[11px] font-bold tabular-nums shrink-0 " +
                            (status === "paid"
                              ? "text-emerald-700"
                              : status === "partial"
                              ? "text-amber-700"
                              : status === "behind"
                              ? "text-red-700"
                              : "text-slate-400")
                          }
                        >
                          {totalRent > 0 ? `${pct}%` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Footer meta */}
                    <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/40 flex items-center gap-4 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold">{villa.totalRooms}</span> rooms
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="font-semibold">{shareholderCount}</span>{" "}
                        {shareholderCount === 1 ? "owner" : "owners"}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return "evening";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
