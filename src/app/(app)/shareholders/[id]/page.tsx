"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { computeProfit } from "@/lib/calculations";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Download, Building2, Pencil, Check, X, TrendingUp, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";

interface VillaEarning {
  villaId: string;
  villaNumber: string;
  percentage: number;
  earnings: number;
}

interface SourceEarning {
  shareId: string;
  sourceName: string;
  propertyName: string;
  myShareOwnerPercent: number; // entry.mySharePercent
  sharePercent: number;          // their % of owner's cut
  profit: number;
  earnings: number;
}

export default function ShareholderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "" });

  const { data: shareholder, isLoading } = useQuery({
    queryKey: ["shareholder", id],
    queryFn: async () => {
      const res = await fetch(`/api/shareholders/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; email: string }) => {
      const res = await fetch(`/api/shareholders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareholder", id] });
      qc.invalidateQueries({ queryKey: ["shareholders"] });
      setEditing(false);
      toast("Shareholder updated");
    },
    onError: () => toast("Update failed", "error"),
  });

  if (isLoading) return <PageSpinner />;
  if (!shareholder) return <div className="p-6 text-slate-500">Shareholder not found.</div>;

  function startEdit() {
    setEditForm({
      name: shareholder.name,
      phone: shareholder.phone ?? "",
      email: shareholder.email ?? "",
    });
    setEditing(true);
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthLabel = format(now, "MMMM yyyy");

  const villaEarnings: VillaEarning[] = (shareholder.villas ?? []).map(
    (vs: {
      percentage: unknown;
      villa: {
        id: string;
        villaNumber: string;
        address: string;
        rooms?: { records?: { rentAmount: unknown; paidAmount: unknown; year: number; month: number }[] }[];
        expenses?: { amount: unknown; year: number; month: number }[];
      };
    }) => {
      const v = vs.villa;
      const rooms = (v.rooms ?? []).map((r) => {
        const rec = (r.records ?? []).find(
          (rec) => rec.year === currentYear && rec.month === currentMonth
        );
        return { rentAmount: rec?.rentAmount ?? 0, paidAmount: rec?.paidAmount ?? 0 };
      });
      const expenses = (v.expenses ?? []).filter(
        (e) => e.year === currentYear && e.month === currentMonth
      );
      const profit = computeProfit(rooms, expenses, [
        { id: shareholder.id, name: shareholder.name, percentage: parseDecimal(vs.percentage) },
      ]);
      return {
        villaId: v.id,
        villaNumber: v.villaNumber,
        percentage: parseDecimal(vs.percentage),
        earnings: profit.shareholderSplits[0]?.amount ?? 0,
      };
    }
  );

  const sourceEarnings: SourceEarning[] = (shareholder.incomeSourceShares ?? []).map(
    (share: {
      id: string;
      sharePercent: unknown;
      entry: {
        propertyName: string;
        mySharePercent: unknown;
        incomeSource: { name: string };
        records?: { year: number; month: number; profit: unknown }[];
      };
    }) => {
      const sharePercent = parseDecimal(share.sharePercent);
      const ownerPct = parseDecimal(share.entry.mySharePercent);
      const rec = (share.entry.records ?? []).find(
        (r) => r.year === currentYear && r.month === currentMonth
      );
      const profit = rec ? parseDecimal(rec.profit) : 0;
      const myCut = (profit * ownerPct) / 100;
      const earnings = (myCut * sharePercent) / 100;
      return {
        shareId: share.id,
        sourceName: share.entry.incomeSource.name,
        propertyName: share.entry.propertyName,
        myShareOwnerPercent: ownerPct,
        sharePercent,
        profit,
        earnings,
      };
    }
  );

  const totalVillaEarnings = villaEarnings.reduce((sum, ve) => sum + ve.earnings, 0);
  const totalSourceEarnings = sourceEarnings.reduce((sum, se) => sum + se.earnings, 0);
  const totalEarnings = totalVillaEarnings + totalSourceEarnings;
  const earningPositive = totalEarnings >= 0;
  const totalEntries = villaEarnings.length + sourceEarnings.length;

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        <Link
          href="/shareholders"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Shareholders
        </Link>

        {/* Person card */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white font-bold text-[18px] sm:text-[22px]">
              {shareholder.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-col gap-3">
                  <input
                    className="text-[18px] sm:text-[20px] font-bold border-b-2 border-amber-500 outline-none bg-transparent w-full pb-1"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="tel"
                      inputMode="tel"
                      className="flex-1 h-10 text-[15px] sm:text-[13px] border-b border-slate-300 outline-none bg-transparent focus:border-amber-500 px-1"
                      placeholder="Phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                    <input
                      type="email"
                      className="flex-1 h-10 text-[15px] sm:text-[13px] border-b border-slate-300 outline-none bg-transparent focus:border-amber-500 px-1"
                      placeholder="Email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-slate-900 truncate">
                    {shareholder.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-3 sm:gap-y-0 mt-1.5">
                    {shareholder.phone && (
                      <a
                        href={`tel:${shareholder.phone}`}
                        className="flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-amber-700 min-h-[24px]"
                      >
                        <Phone className="h-3 w-3 shrink-0" />
                        {shareholder.phone}
                      </a>
                    )}
                    {shareholder.email && (
                      <a
                        href={`mailto:${shareholder.email}`}
                        className="flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-amber-700 min-h-[24px] truncate"
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{shareholder.email}</span>
                      </a>
                    )}
                    {!shareholder.phone && !shareholder.email && (
                      <span className="text-[12.5px] text-slate-400 italic">No contact info</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Action buttons separate row on mobile */}
          <div className="flex gap-2 mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-6 justify-end">
            {editing ? (
              <>
                <Button
                  size="md"
                  onClick={() => updateMutation.mutate(editForm)}
                  loading={updateMutation.isPending}
                  className="flex-1 sm:flex-initial"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="flex-1 sm:flex-initial"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="md" variant="secondary" onClick={startEdit} className="flex-1 sm:flex-initial">
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <a
                  href={`/api/pdf/shareholder/${id}?year=${currentYear}&month=${currentMonth}`}
                  target="_blank"
                  className="flex-1 sm:flex-initial"
                >
                  <Button size="md" variant="secondary" className="w-full">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Earnings hero */}
        <div
          className={
            "rounded-xl p-5 sm:p-6 mb-5 sm:mb-6 border " +
            (earningPositive
              ? "bg-gradient-to-br from-emerald-50 to-emerald-50/40 border-emerald-200"
              : "bg-gradient-to-br from-red-50 to-red-50/40 border-red-200")
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p
                className={
                  "text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 " +
                  (earningPositive ? "text-emerald-800" : "text-red-800")
                }
              >
                Earnings — {monthLabel}
              </p>
              <p
                className={
                  "font-display text-[26px] sm:text-[32px] font-bold tabular-nums tracking-tight break-words " +
                  (earningPositive ? "text-emerald-700" : "text-red-700")
                }
              >
                {formatQAR(totalEarnings)}
              </p>
              <p className="text-[12px] sm:text-[12.5px] text-slate-600 mt-1">
                Across {totalEntries} {totalEntries === 1 ? "property" : "properties"}
                {sourceEarnings.length > 0 && villaEarnings.length > 0 && (
                  <> · {villaEarnings.length} villa{villaEarnings.length === 1 ? "" : "s"} + {sourceEarnings.length} source{sourceEarnings.length === 1 ? "" : "s"}</>
                )}
              </p>
            </div>
            <div
              className={
                "shrink-0 hidden sm:flex h-14 w-14 items-center justify-center rounded-xl " +
                (earningPositive ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
              }
            >
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Villa breakdown */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700">
              Properties
            </p>
            <p className="text-[11px] text-slate-500">{villaEarnings.length} villas</p>
          </div>

          {villaEarnings.length === 0 ? (
            <div className="px-5 py-10 sm:py-12 text-center">
              <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[13px] text-slate-500">
                Not assigned to any villas yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {villaEarnings.map((ve) => (
                <Link
                  key={ve.villaId}
                  href={`/villas/${ve.villaId}`}
                  className="group flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 active:bg-slate-100/60 transition-colors min-h-[60px]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] sm:text-[13.5px] font-semibold text-slate-900 group-hover:text-amber-700 truncate">
                        {ve.villaNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{ve.percentage}% share</p>
                    </div>
                  </div>
                  <span
                    className={
                      "font-mono tabular-nums font-semibold text-[14px] shrink-0 " +
                      (ve.earnings >= 0 ? "text-emerald-700" : "text-red-700")
                    }
                  >
                    {formatQAR(ve.earnings)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {villaEarnings.length > 0 && (
            <div className="bg-amber-50/50 px-4 sm:px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-wider font-bold text-slate-700">
                Villa total
              </span>
              <span
                className={
                  "font-mono tabular-nums font-bold text-[16px] " +
                  (totalVillaEarnings >= 0 ? "text-emerald-700" : "text-red-700")
                }
              >
                {formatQAR(totalVillaEarnings)}
              </span>
            </div>
          )}
        </div>

        {/* Income source earnings */}
        {sourceEarnings.length > 0 && (
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mt-5 sm:mt-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700">
                External income shares
              </p>
              <p className="text-[11px] text-slate-500">{sourceEarnings.length} {sourceEarnings.length === 1 ? "property" : "properties"}</p>
            </div>

            <div className="divide-y divide-slate-100">
              {sourceEarnings.map((se) => (
                <div
                  key={se.shareId}
                  className="flex items-center justify-between px-4 sm:px-5 py-3.5 min-h-[60px]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] sm:text-[13.5px] font-semibold text-slate-900 truncate">
                        {se.propertyName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        From <span className="font-semibold">{se.sourceName}</span> · {pct(se.sharePercent)} of their cut
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={
                        "font-mono tabular-nums font-semibold text-[14px] " +
                        (se.earnings >= 0 ? "text-emerald-700" : "text-red-700")
                      }
                    >
                      {formatQAR(se.earnings)}
                    </p>
                    {se.profit > 0 && (
                      <p className="text-[10.5px] text-slate-400 tabular-nums mt-0.5">
                        from {formatQAR(se.profit)} profit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50/50 px-4 sm:px-5 py-3.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-wider font-bold text-slate-700">
                Source total
              </span>
              <span
                className={
                  "font-mono tabular-nums font-bold text-[16px] " +
                  (totalSourceEarnings >= 0 ? "text-emerald-700" : "text-red-700")
                }
              >
                {formatQAR(totalSourceEarnings)}
              </span>
            </div>
          </div>
        )}

        {/* Grand total */}
        {(villaEarnings.length > 0 || sourceEarnings.length > 0) && (
          <div className="mt-5 sm:mt-6 rounded-xl bg-slate-950 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-400">
                Grand total · {monthLabel}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Villas + income source shares combined
              </p>
            </div>
            <span
              className={
                "font-mono tabular-nums font-bold text-[20px] sm:text-[24px] " +
                (earningPositive ? "text-emerald-400" : "text-red-400")
              }
            >
              {formatQAR(totalEarnings)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function pct(n: number) {
  return `${Number(n).toFixed(2)}%`;
}
