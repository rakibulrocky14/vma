"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";
import { Save, RotateCcw, Lock, DoorOpen, CheckCircle2, AlertCircle } from "lucide-react";

interface Room {
  id: string;
  roomNumber: string;
  records: { rentAmount: unknown; paidAmount: unknown; year: number; month: number }[];
}

interface Props {
  villaId: string;
  rooms: Room[];
  year: number;
  month: number;
  isClosed: boolean;
  onSaved: () => void;
}

interface RowState {
  roomId: string;
  roomNumber: string;
  rentAmount: string;
  paidAmount: string;
}

function emptyRow(r: Room, year: number, month: number): RowState {
  const records = r.records ?? [];
  const rec = records.find((rec) => rec.year === year && rec.month === month) ?? records[0];
  return {
    roomId: r.id,
    roomNumber: r.roomNumber,
    rentAmount: rec ? String(parseDecimal(rec.rentAmount)) : "0",
    paidAmount: rec ? String(parseDecimal(rec.paidAmount)) : "0",
  };
}

export function RoomsBulkEditor({ villaId, rooms, year, month, isClosed, onSaved }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setRows(rooms.map((r) => emptyRow(r, year, month)));
    setDirty(false);
  }, [rooms, year, month]);

  function updateRow(index: number, field: "rentAmount" | "paidAmount", value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setDirty(true);
  }

  function resetAll() {
    setRows(rooms.map((r) => emptyRow(r, year, month)));
    setDirty(false);
  }

  function markPaidInFull() {
    setRows((prev) =>
      prev.map((r) => ({ ...r, paidAmount: r.rentAmount || "0" }))
    );
    setDirty(true);
  }

  function markRowPaid(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, paidAmount: r.rentAmount || "0" } : r))
    );
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/villas/${villaId}/rooms/bulk`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        month,
        rooms: rows.map((r) => ({
          roomId: r.roomId,
          rentAmount: parseFloat(r.rentAmount) || 0,
          paidAmount: parseFloat(r.paidAmount) || 0,
        })),
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast("Rooms saved");
      setDirty(false);
      onSaved();
    } else {
      const data = await res.json();
      toast(data.error ?? "Save failed", "error");
    }
  }

  const totals = rows.reduce(
    (acc, r) => ({
      rent: acc.rent + (parseFloat(r.rentAmount) || 0),
      paid: acc.paid + (parseFloat(r.paidAmount) || 0),
    }),
    { rent: 0, paid: 0 }
  );

  const totalDue = totals.rent - totals.paid;
  const dirtyCount = rows.filter((r, i) => {
    const orig = emptyRow(rooms[i], year, month);
    return r.rentAmount !== orig.rentAmount || r.paidAmount !== orig.paidAmount;
  }).length;

  return (
    <>
      {/* === MOBILE: CARD LIST === */}
      <div className="md:hidden space-y-2.5">
        {rows.map((row, i) => {
          const rent = parseFloat(row.rentAmount) || 0;
          const paid = parseFloat(row.paidAmount) || 0;
          const due = rent - paid;
          const overdue = due > 0 && rent > 0;
          const fullyPaid = rent > 0 && due <= 0;

          return (
            <div
              key={row.roomId}
              className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden"
            >
              {/* Card header: room number + status */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <DoorOpen className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[15px] font-bold text-slate-900">
                    {row.roomNumber}
                  </p>
                </div>
                {fullyPaid ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid
                  </span>
                ) : overdue ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold ring-1 ring-red-200">
                    <AlertCircle className="h-3 w-3" />
                    {formatQAR(due)} due
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">No rent set</span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Rent */}
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Rent
                  </label>
                  {isClosed ? (
                    <p className="text-[16px] font-mono tabular-nums font-semibold text-slate-800">
                      {formatQAR(rent)}
                    </p>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.01}
                        value={row.rentAmount}
                        onChange={(e) => updateRow(i, "rentAmount", e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-[16px] font-mono tabular-nums font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        QAR
                      </span>
                    </div>
                  )}
                </div>

                {/* Paid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Paid
                    </label>
                    {!isClosed && !fullyPaid && rent > 0 && (
                      <button
                        type="button"
                        onClick={() => markRowPaid(i)}
                        className="text-[11px] font-semibold text-amber-700 active:text-amber-900 cursor-pointer"
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                  {isClosed ? (
                    <p className="text-[16px] font-mono tabular-nums font-semibold text-emerald-700">
                      {formatQAR(paid)}
                    </p>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.01}
                        value={row.paidAmount}
                        onChange={(e) => updateRow(i, "paidAmount", e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-[16px] font-mono tabular-nums font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        QAR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile totals card */}
        {rows.length > 0 && (
          <div className="rounded-xl bg-slate-900 text-white px-4 py-3.5 mt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 mb-2">
              Totals
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Rent</p>
                <p className="text-[14px] font-mono tabular-nums font-bold text-white mt-0.5">
                  {formatQAR(totals.rent)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Paid</p>
                <p className="text-[14px] font-mono tabular-nums font-bold text-emerald-400 mt-0.5">
                  {formatQAR(totals.paid)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Due</p>
                <p
                  className={
                    "text-[14px] font-mono tabular-nums font-bold mt-0.5 " +
                    (totalDue > 0 ? "text-red-400" : "text-slate-500")
                  }
                >
                  {formatQAR(totalDue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === DESKTOP: TABLE === */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-900">
                <th className="text-left px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300 w-20">
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
              {rows.map((row, i) => {
                const rent = parseFloat(row.rentAmount) || 0;
                const paid = parseFloat(row.paidAmount) || 0;
                const due = rent - paid;
                const overdue = due > 0 && rent > 0;
                return (
                  <tr
                    key={row.roomId}
                    className={
                      "border-b border-slate-100 last:border-0 transition-colors " +
                      (i % 2 === 1 ? "bg-slate-50/40 " : "") +
                      "hover:bg-amber-50/40"
                    }
                  >
                    <td className="px-4 py-1.5 font-semibold text-slate-800 text-[13px]">
                      {row.roomNumber}
                    </td>
                    <td className="px-2 py-1.5">
                      {isClosed ? (
                        <span className="block text-right font-mono tabular-nums text-slate-700">
                          {formatQAR(rent)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          value={row.rentAmount}
                          onChange={(e) => updateRow(i, "rentAmount", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                        />
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      {isClosed ? (
                        <span className="block text-right font-mono tabular-nums text-emerald-700 font-medium">
                          {formatQAR(paid)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          value={row.paidAmount}
                          onChange={(e) => updateRow(i, "paidAmount", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                        />
                      )}
                    </td>
                    <td
                      className={
                        "px-4 py-1.5 text-right font-mono tabular-nums text-[13px] font-semibold " +
                        (overdue ? "text-red-700" : "text-slate-300")
                      }
                    >
                      {formatQAR(due)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50/60 border-t-2 border-slate-200">
                <td className="px-4 py-2.5 font-bold text-[12px] uppercase tracking-wider text-slate-700">
                  Total
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatQAR(totals.rent)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-emerald-700">
                  {formatQAR(totals.paid)}
                </td>
                <td
                  className={
                    "px-4 py-2.5 text-right font-mono tabular-nums font-bold " +
                    (totalDue > 0 ? "text-red-700" : "text-slate-400")
                  }
                >
                  {formatQAR(totalDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Quick actions when editable */}
      {!isClosed && !dirty && rooms.length > 0 && (
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-[12px] text-slate-500">
          <span className="hidden md:inline">{rooms.length} rooms · click any cell to edit</span>
          <span className="md:hidden">{rooms.length} rooms · tap to edit</span>
          <button
            type="button"
            onClick={markPaidInFull}
            className="text-amber-700 hover:text-amber-800 active:text-amber-900 font-semibold hover:underline cursor-pointer min-h-[36px] inline-flex items-center"
          >
            Mark all as paid in full
          </button>
        </div>
      )}

      {isClosed && (
        <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500">
          <Lock className="h-3 w-3" />
          This month is closed — reopen to edit.
        </div>
      )}

      {/* Sticky save bar — safe-area aware on mobile */}
      {!isClosed && dirty && (
        <div
          className="sticky z-20 mt-4 animate-fade-in"
          style={{
            bottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="rounded-xl bg-slate-900 text-white px-4 sm:px-5 py-3 shadow-deep flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Save className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate">
                  {dirtyCount} {dirtyCount === 1 ? "room" : "rooms"} unsaved
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {formatQAR(totals.paid)} of {formatQAR(totals.rent)}
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={resetAll}
                aria-label="Discard changes"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 h-10 sm:h-9 rounded-md text-[12px] font-medium text-slate-300 active:bg-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Discard</span>
              </button>
              <Button
                variant="gold"
                size="md"
                onClick={handleSave}
                loading={saving}
                className="!h-10 sm:!h-9"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
