"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RoomsBulkEditor } from "@/components/villa/RoomsBulkEditor";
import { ExpensesList } from "@/components/villa/ExpensesList";
import { ProfitSummary } from "@/components/villa/ProfitSummary";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Download,
  Lock,
  Unlock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface RoomRecord {
  rentAmount: unknown;
  paidAmount: unknown;
  year: number;
  month: number;
}

interface RoomWithRecords {
  id: string;
  roomNumber: string;
  records: RoomRecord[];
}

interface VillaShareholderEntry {
  id: string;
  percentage: unknown;
  shareholder: { id: string; name: string };
}

interface ExpenseEntry {
  id: string;
  description: string;
  amount: unknown;
  year: number;
  month: number;
}

interface MonthlyBookEntry {
  id: string;
  year: number;
  month: number;
  status: "OPEN" | "CLOSED";
}

interface VillaData {
  id: string;
  villaNumber: string;
  address: string;
  totalRooms: number;
  rooms: RoomWithRecords[];
  shareholders: VillaShareholderEntry[];
  expenses: ExpenseEntry[];
  monthlyBooks: MonthlyBookEntry[];
}

export default function VillaPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [confirmClose, setConfirmClose] = useState(false);

  const villaQK = ["villa", id, year, month];
  const { data: villa, isLoading } = useQuery<VillaData>({
    queryKey: villaQK,
    queryFn: async () => {
      const res = await fetch(`/api/villas/${id}?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/villas/${id}/close-month`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: villaQK });
      setConfirmClose(false);
      toast(`${MONTHS_LONG[month - 1]} ${year} closed`);
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const reopenMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/villas/${id}/close-month?year=${year}&month=${month}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: villaQK });
      toast(`${MONTHS_LONG[month - 1]} ${year} reopened`);
    },
    onError: () => toast("Failed to reopen", "error"),
  });

  if (isLoading) return <PageSpinner />;
  if (!villa) return <div className="p-6 text-slate-500">Villa not found.</div>;

  const rooms = villa.rooms ?? [];
  const expenses = villa.expenses ?? [];
  const shareholders = villa.shareholders ?? [];
  const monthBook = villa.monthlyBooks?.[0] ?? null;
  const isClosed = monthBook?.status === "CLOSED";

  const profitRooms = rooms.map((r) => {
    const rec = r.records?.[0];
    return { rentAmount: rec?.rentAmount ?? 0, paidAmount: rec?.paidAmount ?? 0 };
  });

  const monthLabel = `${MONTHS_LONG[month - 1]} ${year}`;
  const villaNum = villa.villaNumber.replace(/^V-?/i, "").slice(0, 3) || "V";

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="min-h-full bg-[#faf7f1]">
      {/* === Header === */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-3 transition-colors min-h-[36px]"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-display font-black text-[15px] sm:text-[18px] shadow-md">
                {villaNum}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <h1 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] leading-none font-black tracking-[-0.02em] text-slate-950 truncate">
                    {villa.villaNumber}
                  </h1>
                  {isClosed ? (
                    <Badge variant="closed">
                      <Lock className="h-2.5 w-2.5" />
                      Closed
                    </Badge>
                  ) : (
                    <Badge variant="open">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Open
                    </Badge>
                  )}
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-slate-500 flex items-center flex-wrap gap-x-1 gap-y-0.5 mt-1.5 sm:mt-2">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{villa.address}</span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span>{villa.totalRooms} {villa.totalRooms === 1 ? "room" : "rooms"}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/api/pdf/villa/${id}?year=${year}&month=${month}`}
                target="_blank"
                className="flex-1 sm:flex-initial"
              >
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">PDF</span>
                </Button>
              </a>
              {isClosed ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => reopenMutation.mutate()}
                  loading={reopenMutation.isPending}
                  className="flex-1 sm:flex-initial"
                >
                  <Unlock className="h-4 w-4" />
                  Reopen
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setConfirmClose(true)}
                  className="flex-1 sm:flex-initial"
                >
                  <Lock className="h-4 w-4" />
                  <span>Close</span>
                </Button>
              )}
            </div>
          </div>

          {/* === Month picker === */}
          <div className="mt-4 sm:mt-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex-1 min-w-0 overflow-x-auto snap-x-mandatory">
                <div className="inline-flex h-10 sm:h-9 items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
                  {MONTHS_SHORT.map((m, i) => {
                    const value = i + 1;
                    const active = value === month;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMonth(value)}
                        className={
                          "snap-center-item h-full px-3 sm:px-2.5 rounded-md text-[13px] sm:text-[12px] font-semibold transition-colors cursor-pointer min-w-[40px] " +
                          (active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900")
                        }
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="h-9 border border-slate-200 rounded-lg bg-white px-3 text-[13px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-600/40 cursor-pointer"
              >
                {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-slate-500">
                Viewing <span className="font-semibold text-slate-700">{monthLabel}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === Body === */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
            {/* Rooms */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-0.5 bg-amber-600 rounded" />
                  <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                    Rent Collection
                  </h2>
                </div>
                <p className="text-[11.5px] text-slate-500">{rooms.length} rooms</p>
              </div>
              <RoomsBulkEditor
                villaId={id}
                rooms={rooms}
                year={year}
                month={month}
                isClosed={isClosed}
                onSaved={() => qc.invalidateQueries({ queryKey: villaQK })}
              />
            </section>

            {/* Expenses */}
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-0.5 bg-amber-600 rounded" />
                  <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                    Expenses
                  </h2>
                </div>
                <p className="text-[11.5px] text-slate-500">
                  {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <ExpensesList
                villaId={id}
                year={year}
                month={month}
                expenses={expenses}
                isClosed={isClosed}
                onChanged={() => qc.invalidateQueries({ queryKey: villaQK })}
              />
            </section>
          </div>

          {/* Right: Profit summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-0.5 bg-amber-600 rounded" />
                <h2 className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-700">
                  Profit Summary
                </h2>
              </div>
            </div>
            <ProfitSummary
              rooms={profitRooms}
              expenses={expenses}
              shareholders={shareholders}
            />
          </aside>
        </div>
      </div>

      {/* Close Month Confirmation */}
      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Close this month?"
      >
        <p className="text-[14px] text-slate-700 mb-3">
          You&apos;re about to close <strong>{monthLabel}</strong> for <strong>{villa.villaNumber}</strong>.
        </p>
        <div className="text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-5">
          Once closed, rents and expenses for this month can&apos;t be edited until you reopen it.
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="md" onClick={() => setConfirmClose(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => closeMutation.mutate()}
            loading={closeMutation.isPending}
          >
            <Lock className="h-3.5 w-3.5" />
            Close month
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
