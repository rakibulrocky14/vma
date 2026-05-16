"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  TrendingUp,
  ChevronRight,
  Wallet,
  Users,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pct(n: number) {
  return n.toFixed(2) + "%";
}

function formatQAR(n: number) {
  return "QAR " + n.toLocaleString("en-QA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ─── Types ──────────────────────────────────────────────── */
interface ShareSummary {
  id: string;
  name: string;
  percentage: number;
  amount: number;
}

interface VillaHolding {
  villaId: string;
  villaNumber: string;
  address: string;
  ownerShare: number;
  totalRooms: number;
  year: number;
  month: number;
  totalCollected: number;
  totalExpenses: number;
  netProfit: number;
  myAmount: number;
  shareholders: ShareSummary[];
}

interface EntryHolding {
  entryId: string;
  propertyName: string;
  mySharePercent: number;
  shares: {
    shareId: string;
    shareholderId: string;
    shareholderName: string;
    sharePercent: number;
    effectivePercent: number;
  }[];
  totalDistributed: number;
  netMyPercent: number;
}

interface SourceHolding {
  sourceId: string;
  sourceName: string;
  sourcePhone: string | null;
  entries: EntryHolding[];
}

interface HoldingsData {
  year: number;
  month: number;
  villas: VillaHolding[];
  incomeSources: SourceHolding[];
}

/* ─── Villa Holding Card ─────────────────────────────────── */
function VillaCard({ villa }: { villa: VillaHolding }) {
  const hasProfitData = villa.netProfit !== 0 || villa.totalCollected !== 0;

  return (
    <Link href={`/villas/${villa.villaId}`}>
      <div className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all overflow-hidden cursor-pointer">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Building2 className="h-4.5 w-4.5 h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[14.5px] font-semibold text-slate-900">
                Villa {villa.villaNumber}
              </p>
              {villa.ownerShare > 0 && (
                <Badge variant="warning">{pct(villa.ownerShare)} my share</Badge>
              )}
              {villa.ownerShare === 0 && (
                <Badge variant="default">No share set</Badge>
              )}
            </div>
            <p className="text-[11.5px] text-slate-500 truncate mt-0.5">{villa.address}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {villa.ownerShare > 0 && hasProfitData && (
          <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/40">
            <div className="px-3 sm:px-4 py-2.5 text-center">
              <p className="text-[10.5px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Collected</p>
              <p className="text-[13px] font-bold text-slate-700 tabular-nums">{formatQAR(villa.totalCollected)}</p>
            </div>
            <div className="px-3 sm:px-4 py-2.5 text-center">
              <p className="text-[10.5px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Net Profit</p>
              <p className={`text-[13px] font-bold tabular-nums ${villa.netProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {formatQAR(villa.netProfit)}
              </p>
            </div>
            <div className="px-3 sm:px-4 py-2.5 text-center">
              <p className="text-[10.5px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">My Cut</p>
              <p className={`text-[13px] font-bold tabular-nums ${villa.myAmount >= 0 ? "text-amber-700" : "text-red-600"}`}>
                {formatQAR(villa.myAmount)}
              </p>
            </div>
          </div>
        )}

        {villa.ownerShare > 0 && !hasProfitData && (
          <div className="border-t border-slate-100 px-4 sm:px-5 py-2.5 bg-slate-50/40">
            <p className="text-[12px] text-slate-400 italic">No rent data for {MONTHS[villa.month - 1]} {villa.year}</p>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Income Source Card ─────────────────────────────────── */
function SourceCard({ source }: { source: SourceHolding }) {
  return (
    <Link href={`/income-sources/${source.sourceId}`}>
      <div className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all overflow-hidden cursor-pointer">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[15px]">
            {source.sourceName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-semibold text-slate-900 truncate">{source.sourceName}</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              {source.entries.length} {source.entries.length === 1 ? "property" : "properties"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {source.entries.length > 0 && (
          <div className="border-t border-slate-100 px-4 sm:px-5 py-2.5 bg-slate-50/40 flex flex-col gap-1.5">
            {source.entries.map((entry) => (
              <div key={entry.entryId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-[12.5px] text-slate-600 truncate">{entry.propertyName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[12px]">
                  <span className="text-slate-400">
                    My share: <span className="font-semibold text-emerald-700">{pct(entry.mySharePercent)}</span>
                  </span>
                  {entry.totalDistributed > 0 && (
                    <span className="text-slate-400">
                      · I keep: <span className="font-semibold text-slate-700">{entry.netMyPercent.toFixed(2)}%</span>
                    </span>
                  )}
                  {entry.shares.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Users className="h-3 w-3" />
                      {entry.shares.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function HoldingsPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data, isLoading } = useQuery<HoldingsData>({
    queryKey: ["holdings", year, month],
    queryFn: async () => {
      const res = await fetch(`/api/holdings?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const totalMyAmount = (data?.villas ?? []).reduce((sum, v) => sum + v.myAmount, 0);
  const hasVillaShares = (data?.villas ?? []).some((v) => v.ownerShare > 0);

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-8 bg-amber-700" />
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
              Overview
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
            My Holdings
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3">
            {isLoading ? (
              <span className="inline-block h-3.5 w-52 rounded bg-slate-200 animate-pulse align-middle" />
            ) : (
              <>Your ownership snapshot · {MONTHS[month - 1]} {year}</>
            )}
          </p>
        </div>

        {/* Summary banner — own villas month total */}
        {!isLoading && hasVillaShares && (
          <div className="rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-white px-5 sm:px-6 py-4 mb-6 flex items-center gap-4 shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Wallet className="h-5 w-5 text-amber-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-amber-200">
                My villa earnings · {MONTHS[month - 1]} {year}
              </p>
              <p className="text-[22px] sm:text-[26px] font-black tracking-tight mt-0.5 tabular-nums">
                {formatQAR(totalMyAmount)}
              </p>
            </div>
            <p className="text-[11px] text-amber-200/70 text-right hidden sm:block">
              Based on collected rent<br />minus expenses
            </p>
          </div>
        )}

        {/* Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <div>
              <div className="h-3.5 w-28 rounded bg-slate-200 animate-pulse mb-3" />
              <div className="flex flex-col gap-2.5">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="rounded-xl bg-white border border-slate-200/80 shadow-card px-5 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-1/3 rounded bg-slate-200 animate-pulse" />
                        <div className="h-2.5 w-1/4 rounded bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            {/* Own Villas Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-amber-700" />
                <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                  My Villas
                </h2>
                <Badge variant="warning">{data?.villas.length ?? 0}</Badge>
              </div>

              {data?.villas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                  <p className="text-[13px] text-slate-500">You don&apos;t manage any villas yet.</p>
                  <Link href="/villas/new" className="inline-block mt-3">
                    <span className="text-[13px] font-semibold text-amber-700 hover:underline">Create a villa →</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {data?.villas.map((villa) => (
                    <VillaCard key={villa.villaId} villa={villa} />
                  ))}
                  {!hasVillaShares && (
                    <p className="text-[12px] text-slate-400 italic px-1">
                      Set &ldquo;My share %&rdquo; when creating or editing a villa to see your earnings here.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Income Sources Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wide">
                  External Income
                </h2>
                <Badge variant="success">{data?.incomeSources.length ?? 0}</Badge>
              </div>

              {data?.incomeSources.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                  <p className="text-[13px] text-slate-500">No external income sources added yet.</p>
                  <Link href="/income-sources" className="inline-block mt-3">
                    <span className="text-[13px] font-semibold text-emerald-700 hover:underline">Add an income source →</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {data?.incomeSources.map((source) => (
                    <SourceCard key={source.sourceId} source={source} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
