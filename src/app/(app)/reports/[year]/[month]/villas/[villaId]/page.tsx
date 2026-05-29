"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ProfitSummary } from "@/components/villa/ProfitSummary";
import { PageSpinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { ArrowLeft, Download, Lock } from "lucide-react";
import Link from "next/link";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function VillaReportSnapshotPage() {
  const { year, month, villaId } = useParams<{ year: string; month: string; villaId: string }>();
  const y = parseInt(year);
  const m = parseInt(month);

  const { data: villaData, isLoading } = useQuery({
    queryKey: ["villa-snapshot", villaId, y, m],
    queryFn: async () => {
      const res = await fetch(`/api/reports/monthly?year=${y}&month=${m}`);
      const villas = await res.json();
      return villas.find((v: { id: string }) => v.id === villaId);
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!villaData) return <div className="p-6">Villa not found.</div>;

  const rooms = (villaData.rooms ?? []).map((r: {
    id: string;
    roomNumber: string;
    carryIn?: number;
    records?: { rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; year: number; month: number }[];
  }) => {
    const rec = (r.records ?? []).find((rec) => rec.year === y && rec.month === m);
    return {
      ...r,
      rentAmount: rec?.rentAmount ?? 0,
      paidAmount: rec?.paidAmount ?? 0,
      commission: rec?.commission ?? 0,
      status: rec?.status ?? "OCCUPIED",
      carryIn: Math.max(0, r.carryIn ?? 0),
    };
  });

  const expenses = (villaData.expenses ?? []).filter((e: { year: number; month: number }) => e.year === y && e.month === m);
  const book = (villaData.monthlyBooks ?? []).find((b: { year: number; month: number }) => b.year === y && b.month === m);
  const shareholders = villaData.shareholders ?? [];

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <Link
          href={`/reports/${year}/${month}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          {MONTHS[m - 1]} {y} Report
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-700 mb-1.5">
              Snapshot · {MONTHS[m - 1]} {y}
            </p>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-slate-900 truncate">
              {villaData.villaNumber}
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-500 mt-0.5 truncate">{villaData.address}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {book?.status === "CLOSED" && (
              <Badge variant="closed">
                <Lock className="h-2.5 w-2.5" />
                Closed
              </Badge>
            )}
            <a href={`/api/pdf/villa/${villaId}?year=${y}&month=${m}`} target="_blank">
              <Button size="md" variant="secondary">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">
            {/* Rooms */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-0.5 bg-amber-600 rounded" />
                <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                  Rooms
                </h2>
              </div>

              {/* MOBILE list */}
              <div className="md:hidden space-y-2">
                {rooms.map(
                  (r: { id: string; roomNumber: string; rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; carryIn?: number }) => {
                    const status = r.status ?? "OCCUPIED";
                    const rent = parseDecimal(r.rentAmount) + (r.carryIn ?? 0);
                    const paid = parseDecimal(r.paidAmount);
                    const due = rent - paid - parseDecimal(r.commission);
                    return (
                      <div
                        key={r.id}
                        className="rounded-lg bg-white border border-slate-200 px-4 py-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[14px] font-bold text-slate-900">{r.roomNumber}</p>
                          {status !== "OCCUPIED" ? (
                            <span
                              className={
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider ring-1 " +
                                (status === "EMPTY"
                                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                                  : "bg-slate-100 text-slate-700 ring-slate-300")
                              }
                            >
                              {status}
                            </span>
                          ) : (
                            <p
                              className={
                                "text-[12px] font-mono tabular-nums font-semibold " +
                                (due > 0 ? "text-red-700" : "text-slate-400")
                              }
                            >
                              {due > 0 ? `${formatQAR(due)} due` : "Settled"}
                            </p>
                          )}
                        </div>
                        {status === "OCCUPIED" && (
                          <div className="grid grid-cols-2 gap-2 text-[12px]">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
                                Rent
                              </p>
                              <p className="font-mono tabular-nums text-slate-800">{formatQAR(rent)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
                                Paid
                              </p>
                              <p className="font-mono tabular-nums text-emerald-700 font-semibold">
                                {formatQAR(paid)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* DESKTOP table */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="text-left px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                        Room
                      </th>
                      <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                        Rent
                      </th>
                      <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                        Paid
                      </th>
                      <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                        Due
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(
                      (
                        r: { id: string; roomNumber: string; rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; carryIn?: number },
                        i: number
                      ) => {
                        const status = r.status ?? "OCCUPIED";
                        const rent = parseDecimal(r.rentAmount) + (r.carryIn ?? 0);
                        const paid = parseDecimal(r.paidAmount);
                        const due = rent - paid - parseDecimal(r.commission);
                        if (status !== "OCCUPIED") {
                          return (
                            <tr
                              key={r.id}
                              className={
                                "border-b border-slate-100 last:border-0 " +
                                (i % 2 === 1 ? "bg-slate-50/40" : "")
                              }
                            >
                              <td className="px-4 py-1.5 font-semibold text-slate-800 text-[13px]">
                                {r.roomNumber}
                              </td>
                              <td
                                className={
                                  "px-4 py-1.5 text-right font-bold text-[12px] tracking-wider " +
                                  (status === "EMPTY" ? "text-amber-700" : "text-slate-600")
                                }
                              >
                                {status}
                              </td>
                              <td className="px-4 py-1.5 text-right text-slate-300 text-[13px]">—</td>
                              <td className="px-4 py-1.5 text-right text-slate-300 text-[13px]">—</td>
                            </tr>
                          );
                        }
                        return (
                          <tr
                            key={r.id}
                            className={
                              "border-b border-slate-100 last:border-0 " +
                              (i % 2 === 1 ? "bg-slate-50/40" : "")
                            }
                          >
                            <td className="px-4 py-1.5 font-semibold text-slate-800 text-[13px]">
                              {r.roomNumber}
                            </td>
                            <td className="px-4 py-1.5 text-right font-mono tabular-nums text-[13px] text-slate-700">
                              {formatQAR(rent)}
                            </td>
                            <td className="px-4 py-1.5 text-right font-mono tabular-nums text-[13px] text-emerald-700 font-medium">
                              {formatQAR(paid)}
                            </td>
                            <td
                              className={
                                "px-4 py-1.5 text-right font-mono tabular-nums text-[13px] font-semibold " +
                                (due > 0 ? "text-red-700" : "text-slate-300")
                              }
                            >
                              {formatQAR(due)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-0.5 bg-amber-600 rounded" />
                <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                  Expenses
                </h2>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {expenses.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[13px] text-slate-500">
                    No expenses recorded.
                  </p>
                ) : (
                  <>
                    {/* Mobile list */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {expenses.map((e: { id: string; description: string; amount: unknown }) => (
                        <div key={e.id} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[13px] text-slate-800 truncate flex-1 mr-2">
                            {e.description}
                          </span>
                          <span className="font-mono tabular-nums text-[13px] font-semibold text-red-700 shrink-0">
                            {formatQAR(parseDecimal(e.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-sm">
                      <thead>
                        <tr className="bg-slate-900">
                          <th className="text-left px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                            Description
                          </th>
                          <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(
                          (e: { id: string; description: string; amount: unknown }, i: number) => (
                            <tr
                              key={e.id}
                              className={
                                "border-b border-slate-100 last:border-0 " +
                                (i % 2 === 1 ? "bg-slate-50/40" : "")
                              }
                            >
                              <td className="px-4 py-2 text-[13px] text-slate-700">{e.description}</td>
                              <td className="px-4 py-2 text-right font-mono tabular-nums text-[13px] font-semibold text-red-700">
                                {formatQAR(parseDecimal(e.amount))}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </section>
          </div>

          <aside>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-0.5 bg-amber-600 rounded" />
              <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                Profit Summary
              </h2>
            </div>
            <ProfitSummary
              rooms={rooms.map((r: { rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; carryIn?: number }) => ({
                rentAmount: r.rentAmount,
                paidAmount: r.paidAmount,
                commission: r.commission,
                status: r.status,
                carryIn: r.carryIn,
              }))}
              expenses={expenses}
              shareholders={shareholders}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
