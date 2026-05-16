"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { BarChart3, ArrowRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ReportsPage() {
  const { data: months, isLoading } = useQuery({
    queryKey: ["monthly-report-index"],
    queryFn: async () => {
      const res = await fetch("/api/reports/monthly");
      return res.json();
    },
  });

  if (isLoading) return <PageSpinner />;

  const grouped: Record<number, { month: number; status: string }[]> = {};
  for (const m of (months ?? []) as { year: number; month: number; status: string }[]) {
    if (!grouped[m.year]) grouped[m.year] = [];
    grouped[m.year].push(m);
  }
  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        <div className="mb-7 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-8 bg-amber-700" />
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
              Archive
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
            Monthly Reports
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3 max-w-xl">
            Browse closed months. Click any month to view the full financial snapshot across all villas.
          </p>
        </div>

        {years.length === 0 && (
          <div className="text-center py-16 sm:py-24 rounded-xl border border-dashed border-slate-300 bg-white px-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <BarChart3 className="h-7 w-7 text-amber-700" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-900">No reports yet</p>
            <p className="text-[13px] sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Close a month on any villa to add it to the archive. You can always reopen it later.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 sm:gap-8">
          {years.map((year) => (
            <section key={year}>
              <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
                <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-slate-900">
                  {year}
                </h2>
                <span className="text-[11.5px] sm:text-[12px] text-slate-500">
                  {grouped[parseInt(year)].length} {grouped[parseInt(year)].length === 1 ? "month" : "months"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {grouped[parseInt(year)]
                  .sort((a, b) => b.month - a.month)
                  .map((entry) => (
                    <Link key={entry.month} href={`/reports/${year}/${entry.month}`}>
                      <article className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 active:bg-slate-50/60 transition-all p-3.5 sm:p-4 min-h-[80px]">
                        <div className="flex items-start justify-between mb-2.5 sm:mb-3">
                          <div className="min-w-0">
                            <p className="text-[14px] sm:text-[15px] font-bold tracking-tight text-slate-900 truncate">
                              {MONTHS[entry.month - 1]}
                            </p>
                            <p className="text-[11px] sm:text-[11.5px] text-slate-500">{year}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                        </div>
                        <Badge variant={entry.status === "CLOSED" ? "closed" : "open"}>
                          {entry.status === "CLOSED" ? "Closed" : "Open"}
                        </Badge>
                      </article>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
