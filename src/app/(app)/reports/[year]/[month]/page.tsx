"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { computeProfit } from "@/lib/calculations";
import { ArrowLeft, Building2, ArrowRight, TrendingUp, Receipt, Wallet } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlyReportPage() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const y = parseInt(year);
  const m = parseInt(month);

  const { data: villas, isLoading } = useQuery({
    queryKey: ["monthly-report", y, m],
    queryFn: async () => {
      const res = await fetch(`/api/reports/monthly?year=${y}&month=${m}`);
      return res.json();
    },
  });

  if (isLoading) return <PageSpinner />;

  const monthLabel = `${MONTHS[m - 1]} ${y}`;
  const list = (villas ?? []) as Array<{
    id: string;
    villaNumber: string;
    address: string;
    rooms?: { records?: { rentAmount: unknown; paidAmount: unknown; year: number; month: number }[] }[];
    expenses?: { amount: unknown; year: number; month: number }[];
    shareholders?: { shareholder: { id: string; name: string }; percentage: unknown }[];
    monthlyBooks?: { year: number; month: number; status: string }[];
  }>;

  // Compute aggregates
  const aggregates = list.reduce(
    (acc, villa) => {
      const rooms = (villa.rooms ?? []).map((r) => {
        const rec = (r.records ?? []).find((rec) => rec.year === y && rec.month === m);
        return { rentAmount: rec?.rentAmount ?? 0, paidAmount: rec?.paidAmount ?? 0 };
      });
      const expenses = (villa.expenses ?? []).filter((e) => e.year === y && e.month === m);
      const s = computeProfit(
        rooms,
        expenses,
        (villa.shareholders ?? []).map((vs) => ({
          id: vs.shareholder.id,
          name: vs.shareholder.name,
          percentage: parseDecimal(vs.percentage),
        }))
      );
      return {
        rent: acc.rent + s.totalRent,
        collected: acc.collected + s.totalCollected,
        expenses: acc.expenses + s.totalExpenses,
        profit: acc.profit + s.netProfit,
      };
    },
    { rent: 0, collected: 0, expenses: 0, profit: 0 }
  );

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          All Reports
        </Link>

        <div className="mb-7 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-8 bg-amber-700" />
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
              Snapshot
            </p>
          </div>
          <h1 className="font-display text-[32px] sm:text-[40px] lg:text-[48px] leading-none font-black tracking-[-0.02em] text-slate-950 break-words">
            {monthLabel}
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3">
            Overview across <span className="font-semibold text-slate-900">{list.length}</span>{" "}
            {list.length === 1 ? "villa" : "villas"}
          </p>
        </div>

        {/* Aggregate strip */}
        {list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
            <AggTile icon={<Wallet className="h-3.5 w-3.5" />} label="Rent" value={formatQAR(aggregates.rent)} />
            <AggTile
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Collected"
              value={formatQAR(aggregates.collected)}
              accent="text-emerald-700"
            />
            <AggTile
              icon={<Receipt className="h-3.5 w-3.5" />}
              label="Expenses"
              value={formatQAR(aggregates.expenses)}
              accent="text-red-700"
            />
            <AggTile
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Net Profit"
              value={formatQAR(aggregates.profit)}
              accent={aggregates.profit >= 0 ? "text-emerald-700" : "text-red-700"}
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:gap-3">
          {list.map((villa) => {
            const rooms = (villa.rooms ?? []).map((r) => {
              const rec = (r.records ?? []).find((rec) => rec.year === y && rec.month === m);
              return { rentAmount: rec?.rentAmount ?? 0, paidAmount: rec?.paidAmount ?? 0 };
            });
            const expenses = (villa.expenses ?? []).filter(
              (e) => e.year === y && e.month === m
            );
            const summary = computeProfit(
              rooms,
              expenses,
              (villa.shareholders ?? []).map((vs) => ({
                id: vs.shareholder.id,
                name: vs.shareholder.name,
                percentage: parseDecimal(vs.percentage),
              }))
            );
            const book = (villa.monthlyBooks ?? []).find((b) => b.year === y && b.month === m);

            return (
              <Link key={villa.id} href={`/reports/${y}/${m}/villas/${villa.id}`}>
                <article className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 active:bg-slate-50/40 transition-all">
                  <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-slate-900 truncate">
                            {villa.villaNumber}
                          </p>
                          <p className="text-[11px] sm:text-[11.5px] text-slate-500 truncate">{villa.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {book?.status ? (
                          <Badge variant={book.status === "CLOSED" ? "closed" : "open"}>
                            {book.status === "CLOSED" ? "Closed" : "Open"}
                          </Badge>
                        ) : (
                          <Badge variant="default">No data</Badge>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t border-slate-100">
                      <Metric label="Rent" value={formatQAR(summary.totalRent)} color="text-slate-700" />
                      <Metric
                        label="Collected"
                        value={formatQAR(summary.totalCollected)}
                        color="text-emerald-700"
                      />
                      <Metric
                        label="Expenses"
                        value={formatQAR(summary.totalExpenses)}
                        color="text-red-700"
                      />
                      <Metric
                        label="Net"
                        value={formatQAR(summary.netProfit)}
                        color={summary.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}
                      />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AggTile({
  icon,
  label,
  value,
  accent = "text-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-white border border-slate-200/80 shadow-card px-3.5 sm:px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[9.5px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
      </div>
      <p className={`text-[14px] sm:text-[16px] font-bold tabular-nums tracking-tight break-words ${accent}`}>
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] sm:text-[10.5px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
        {label}
      </p>
      <p className={`text-[12px] sm:text-[13px] font-mono tabular-nums font-semibold break-words ${color}`}>
        {value}
      </p>
    </div>
  );
}
