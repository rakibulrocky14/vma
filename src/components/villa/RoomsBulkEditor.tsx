"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";
import { Save, RotateCcw, Lock, DoorOpen, CheckCircle2, AlertCircle } from "lucide-react";

type RoomStatus = "OCCUPIED" | "EMPTY" | "SOLD";

interface Room {
  id: string;
  roomNumber: string;
  carryIn?: number;
  records: { rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: RoomStatus | null; year: number; month: number }[];
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
  commission: string;
  status: RoomStatus;
  carryIn: number;
}

function emptyRow(r: Room, year: number, month: number): RowState {
  const records = r.records ?? [];
  const rec = records.find((rec) => rec.year === year && rec.month === month) ?? records[0];
  const rentNum = rec ? parseDecimal(rec.rentAmount) : 0;
  const paidNum = rec ? parseDecimal(rec.paidAmount) : 0;
  const commNum = rec ? parseDecimal(rec.commission) : 0;
  return {
    roomId: r.id,
    roomNumber: r.roomNumber,
    // Empty when zero so there's no "0" to delete before typing
    rentAmount: rentNum ? String(rentNum) : "",
    paidAmount: paidNum ? String(paidNum) : "",
    commission: commNum ? String(commNum) : "",
    status: (rec?.status as RoomStatus) ?? "OCCUPIED",
    carryIn: Math.max(0, r.carryIn ?? 0),
  };
}

/* Small status switcher — native select, no clipping issues, native pickers on mobile */
function StatusSelect({
  value,
  onChange,
  className = "",
}: {
  value: RoomStatus;
  onChange: (s: RoomStatus) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RoomStatus)}
      aria-label="Room status"
      className={
        "shrink-0 rounded-md border bg-white text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-600/40 " +
        (value === "OCCUPIED"
          ? "border-slate-200 text-slate-600"
          : value === "EMPTY"
            ? "border-amber-300 text-amber-700 bg-amber-50"
            : "border-slate-300 text-slate-700 bg-slate-100") +
        " " +
        className
      }
    >
      <option value="OCCUPIED">Rent</option>
      <option value="EMPTY">Empty</option>
      <option value="SOLD">Sold</option>
    </select>
  );
}

/* The word shown inside the rent field */
function StatusWord({ status, align = "right" }: { status: "EMPTY" | "SOLD"; align?: "right" | "center" }) {
  const cls =
    status === "EMPTY"
      ? "text-amber-700 bg-amber-50 ring-amber-200"
      : "text-slate-700 bg-slate-100 ring-slate-300";
  return (
    <span
      className={
        "inline-flex items-center justify-center px-2 py-1 rounded-md ring-1 font-bold tracking-wider text-[12px] " +
        cls +
        (align === "center" ? " w-full" : "")
      }
    >
      {status}
    </span>
  );
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
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: value };
        // If a commission is set, keep Paid = Rent − Commission (the on-spot deduction)
        if (field === "rentAmount") {
          const comm = parseFloat(next.commission) || 0;
          if (comm > 0) {
            const net = (parseFloat(value) || 0) - comm;
            next.paidAmount = net > 0 ? String(net) : "0";
          }
        }
        return next;
      })
    );
    setDirty(true);
  }

  function setCommission(index: number, value: string) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const comm = parseFloat(value) || 0;
        const baseRent = parseFloat(r.rentAmount) || 0;
        // Deduct on spot: Paid auto-fills to Rent − Commission
        const net = baseRent - comm;
        return {
          ...r,
          commission: value,
          paidAmount: comm > 0 ? (net > 0 ? String(net) : "0") : r.paidAmount,
        };
      })
    );
    setDirty(true);
  }

  function setStatus(index: number, status: RoomStatus) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (status === "OCCUPIED") return { ...r, status };
        // empty / sold → clear amounts
        return { ...r, status, rentAmount: "0", paidAmount: "0", commission: "" };
      })
    );
    setDirty(true);
  }

  function resetAll() {
    setRows(rooms.map((r) => emptyRow(r, year, month)));
    setDirty(false);
  }

  function fullDue(r: RowState) {
    // Amount owner should collect = rent + carried − commission
    const net = (parseFloat(r.rentAmount) || 0) + r.carryIn - (parseFloat(r.commission) || 0);
    return net > 0 ? String(net) : "0";
  }

  function markPaidInFull() {
    setRows((prev) =>
      prev.map((r) => (r.status === "OCCUPIED" ? { ...r, paidAmount: fullDue(r) } : r))
    );
    setDirty(true);
  }

  function markRowPaid(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, paidAmount: fullDue(r) } : r))
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
          rentAmount: r.status === "OCCUPIED" ? parseFloat(r.rentAmount) || 0 : 0,
          paidAmount: r.status === "OCCUPIED" ? parseFloat(r.paidAmount) || 0 : 0,
          commission: r.status === "OCCUPIED" ? parseFloat(r.commission) || 0 : 0,
          status: r.status,
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

  // Only occupied rooms count toward totals; expected rent includes carried balance
  const totals = rows.reduce(
    (acc, r) => {
      if (r.status !== "OCCUPIED") return acc;
      return {
        rent: acc.rent + (parseFloat(r.rentAmount) || 0) + r.carryIn,
        paid: acc.paid + (parseFloat(r.paidAmount) || 0),
        commission: acc.commission + (parseFloat(r.commission) || 0),
      };
    },
    { rent: 0, paid: 0, commission: 0 }
  );

  const totalDue = totals.rent - totals.paid - totals.commission;
  const totalCarried = rows.reduce(
    (acc, r) => (r.status === "OCCUPIED" ? acc + r.carryIn : acc),
    0
  );
  const dirtyCount = rows.filter((r, i) => {
    const orig = emptyRow(rooms[i], year, month);
    return (
      r.rentAmount !== orig.rentAmount ||
      r.paidAmount !== orig.paidAmount ||
      r.commission !== orig.commission ||
      r.status !== orig.status
    );
  }).length;

  const emptyCount = rows.filter((r) => r.status === "EMPTY").length;
  const soldCount = rows.filter((r) => r.status === "SOLD").length;

  return (
    <>
      {/* === MOBILE: CARD LIST === */}
      <div className="md:hidden space-y-2.5">
        {rows.map((row, i) => {
          const baseRent = parseFloat(row.rentAmount) || 0;
          const rent = baseRent + row.carryIn; // expected = this month + carried
          const paid = parseFloat(row.paidAmount) || 0;
          const commission = parseFloat(row.commission) || 0;
          const due = rent - paid - commission;
          const overdue = due > 0 && rent > 0;
          const fullyPaid = rent > 0 && due <= 0;
          const occupied = row.status === "OCCUPIED";

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
                  <p className="text-[15px] font-bold text-slate-900">{row.roomNumber}</p>
                </div>
                {!occupied ? (
                  <span
                    className={
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider ring-1 " +
                      (row.status === "EMPTY"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-slate-100 text-slate-700 ring-slate-300")
                    }
                  >
                    {row.status}
                  </span>
                ) : fullyPaid ? (
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Rent
                    </label>
                    {!isClosed && (
                      <StatusSelect
                        value={row.status}
                        onChange={(s) => setStatus(i, s)}
                        className="h-7 px-2"
                      />
                    )}
                  </div>
                  {!occupied ? (
                    <StatusWord status={row.status as "EMPTY" | "SOLD"} align="center" />
                  ) : isClosed ? (
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
                        placeholder="0"
                        value={row.rentAmount}
                        onChange={(e) => updateRow(i, "rentAmount", e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-[16px] font-mono tabular-nums font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        QAR
                      </span>
                    </div>
                  )}
                </div>

                {/* Paid — only when occupied */}
                {occupied && (
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
                          placeholder="0"
                          value={row.paidAmount}
                          onChange={(e) => updateRow(i, "paidAmount", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-[16px] font-mono tabular-nums font-semibold text-emerald-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                          QAR
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Commission — only when occupied */}
                {occupied && (
                  <div>
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Commission {commission > 0 && <span className="text-amber-600 normal-case font-medium">(deducted from paid)</span>}
                    </label>
                    {isClosed ? (
                      <p className="text-[16px] font-mono tabular-nums font-semibold text-amber-700">
                        {formatQAR(commission)}
                      </p>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          placeholder="0"
                          value={row.commission}
                          onChange={(e) => setCommission(i, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-3 pr-14 text-[16px] font-mono tabular-nums font-semibold text-amber-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                          QAR
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
            {totalCarried > 0 && (
              <p className="text-[11px] text-amber-300 mt-2.5">
                Includes {formatQAR(totalCarried)} carried from previous months
              </p>
            )}
            {(emptyCount > 0 || soldCount > 0) && (
              <p className="text-[11px] text-slate-400 mt-1">
                {emptyCount > 0 && `${emptyCount} empty`}
                {emptyCount > 0 && soldCount > 0 && " · "}
                {soldCount > 0 && `${soldCount} sold`}
                {" "}— excluded from totals
              </p>
            )}
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
                <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-amber-300/90">
                  Commission
                </th>
                <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                  Due
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const baseRent = parseFloat(row.rentAmount) || 0;
                const rent = baseRent + row.carryIn; // expected = this month + carried
                const paid = parseFloat(row.paidAmount) || 0;
                const commission = parseFloat(row.commission) || 0;
                const due = rent - paid - commission;
                const overdue = due > 0 && rent > 0;
                const occupied = row.status === "OCCUPIED";
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
                    {/* RENT */}
                    <td className="px-2 py-1.5">
                      {isClosed ? (
                        occupied ? (
                          <span className="block text-right font-mono tabular-nums text-slate-700">
                            {formatQAR(rent)}
                          </span>
                        ) : (
                          <span className="flex justify-end">
                            <StatusWord status={row.status as "EMPTY" | "SOLD"} />
                          </span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end">
                          {occupied ? (
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step={0.01}
                              placeholder="0"
                              value={row.rentAmount}
                              onChange={(e) => updateRow(i, "rentAmount", e.target.value)}
                              onFocus={(e) => e.target.select()}
                              className="w-full text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                            />
                          ) : (
                            <StatusWord status={row.status as "EMPTY" | "SOLD"} />
                          )}
                          <StatusSelect
                            value={row.status}
                            onChange={(s) => setStatus(i, s)}
                            className="h-7 px-1.5"
                          />
                        </div>
                      )}
                    </td>
                    {/* PAID */}
                    <td className="px-2 py-1.5">
                      {!occupied ? (
                        <span className="block text-right text-slate-300 text-[13px]">—</span>
                      ) : isClosed ? (
                        <span className="block text-right font-mono tabular-nums text-emerald-700 font-medium">
                          {formatQAR(paid)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          placeholder="0"
                          value={row.paidAmount}
                          onChange={(e) => updateRow(i, "paidAmount", e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums text-emerald-700 font-medium placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                        />
                      )}
                    </td>
                    {/* COMMISSION */}
                    <td className="px-2 py-1.5">
                      {!occupied ? (
                        <span className="block text-right text-slate-300 text-[13px]">—</span>
                      ) : isClosed ? (
                        <span className="block text-right font-mono tabular-nums text-amber-700 font-medium">
                          {commission > 0 ? formatQAR(commission) : "—"}
                        </span>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          placeholder="0"
                          value={row.commission}
                          onChange={(e) => setCommission(i, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums text-amber-700 font-medium placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                        />
                      )}
                    </td>
                    {/* DUE */}
                    <td
                      className={
                        "px-4 py-1.5 text-right font-mono tabular-nums text-[13px] font-semibold " +
                        (overdue ? "text-red-700" : "text-slate-300")
                      }
                    >
                      {occupied ? formatQAR(due) : "—"}
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
                <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-amber-700">
                  {totals.commission > 0 ? formatQAR(totals.commission) : "—"}
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

      {/* Carried-forward note (desktop) */}
      {totalCarried > 0 && (
        <div className="hidden md:flex mt-2 items-center gap-1.5 text-[12px] text-amber-700">
          <span className="font-semibold">{formatQAR(totalCarried)}</span>
          <span className="text-slate-500">in unpaid balance carried from previous months is included in the expected rent &amp; due.</span>
        </div>
      )}

      {/* Quick actions when editable */}
      {!isClosed && !dirty && rooms.length > 0 && (
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-[12px] text-slate-500">
          <span className="hidden md:inline">
            {rooms.length} rooms
            {(emptyCount > 0 || soldCount > 0) &&
              ` · ${emptyCount + soldCount} not earning`}
            {" "}· click any cell to edit
          </span>
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

      {/* Sticky save bar */}
      {!isClosed && dirty && (
        <div
          className="sticky z-20 mt-4 animate-fade-in"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
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
