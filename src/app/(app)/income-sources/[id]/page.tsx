"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  Building2,
  Plus,
  Trash2,
  Pencil,
  Phone,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────── */
interface ShareRow {
  id: string;
  shareholderId: string;
  shareholder: { id: string; name: string };
  sharePercent: number;
}

interface RecordRow {
  id: string;
  year: number;
  month: number;
  profit: number;
}

interface EntryRow {
  id: string;
  propertyName: string;
  mySharePercent: number;
  shares: ShareRow[];
  records: RecordRow[];
}

interface SourceDetail {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  entries: EntryRow[];
  year: number;
  month: number;
}

interface ShareholderOption {
  id: string;
  name: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
function pct(n: number | string) {
  return Number(n).toFixed(2) + "%";
}

function qar(n: number) {
  return "QAR " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Add Entry Form ─────────────────────────────────────── */
function AddEntryForm({
  sourceId,
  shareholders,
  onSaved,
}: {
  sourceId: string;
  shareholders: ShareholderOption[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [myShare, setMyShare] = useState("");
  const [shares, setShares] = useState<{ shareholderId: string; sharePercent: string }[]>([]);

  const totalSharePct = shares.reduce((sum, s) => sum + (parseFloat(s.sharePercent) || 0), 0);

  function addShare() {
    setShares((p) => [...p, { shareholderId: "", sharePercent: "" }]);
  }
  function removeShare(i: number) {
    setShares((p) => p.filter((_, idx) => idx !== i));
  }
  function updateShare(i: number, field: "shareholderId" | "sharePercent", val: string) {
    setShares((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyName || !myShare) return;
    setLoading(true);
    const res = await fetch(`/api/income-sources/${sourceId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyName,
        mySharePercent: parseFloat(myShare),
        shares: shares
          .filter((s) => s.shareholderId && s.sharePercent)
          .map((s) => ({
            shareholderId: s.shareholderId,
            sharePercent: parseFloat(s.sharePercent),
          })),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setPropertyName("");
      setMyShare("");
      setShares([]);
      setOpen(false);
      onSaved();
    } else {
      const d = await res.json();
      toast(d.error ?? "Failed to add", "error");
    }
  }

  const usedIds = shares.map((s) => s.shareholderId).filter(Boolean);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white hover:border-amber-400 hover:bg-amber-50/40 text-slate-500 hover:text-amber-700 transition-all px-4 py-3 text-[13.5px] font-medium w-full cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add property / villa
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/30 overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-amber-200/60 flex items-center justify-between">
        <p className="text-[13.5px] font-semibold text-amber-900">New property</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setShares([]); }}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Property / Villa name"
            placeholder="Villa 5A, Lusail"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="My share %"
            type="number"
            inputMode="decimal"
            min={0.01}
            max={100}
            step={0.01}
            placeholder="25"
            value={myShare}
            onChange={(e) => setMyShare(e.target.value)}
            required
            hint="Your % of this property's profit"
          />
        </div>

        {/* Shareholder distributions */}
        {shares.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
              Who shares in your cut?
            </p>
            {shares.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 cursor-pointer"
                    value={row.shareholderId}
                    onChange={(e) => updateShare(i, "shareholderId", e.target.value)}
                    required
                  >
                    <option value="">Select shareholder…</option>
                    {shareholders
                      .filter((s) => !usedIds.includes(s.id) || s.id === row.shareholderId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
                <div className="w-28 shrink-0">
                  <Input
                    label=""
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    max={100}
                    step={0.01}
                    placeholder="% of my cut"
                    value={row.sharePercent}
                    onChange={(e) => updateShare(i, "sharePercent", e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeShare(i)}
                  className="mb-0.5 h-10 w-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {totalSharePct > 0 && (
              <p className={`text-[11.5px] font-medium ${totalSharePct > 100 ? "text-red-600" : "text-slate-500"}`}>
                Total distribution: {totalSharePct.toFixed(2)}% of your cut
                {totalSharePct > 100 && " — exceeds 100%!"}
              </p>
            )}
          </div>
        )}

        {shareholders.length > 0 && (
          <button
            type="button"
            onClick={addShare}
            className="self-start flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-amber-700 font-medium transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add shareholder distribution
          </button>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => { setOpen(false); setShares([]); }}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Add property
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ─── Entry Card ─────────────────────────────────────────── */
function EntryCard({
  entry,
  year,
  month,
  shareholders,
  onMutated,
}: {
  entry: EntryRow;
  year: number;
  month: number;
  shareholders: ShareholderOption[];
  onMutated: () => void;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(entry.propertyName);
  const [editShare, setEditShare] = useState(String(entry.mySharePercent));
  const [editLoading, setEditLoading] = useState(false);
  const [addShareOpen, setAddShareOpen] = useState(false);
  const [newShareHolder, setNewShareHolder] = useState("");
  const [newSharePct, setNewSharePct] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  const existingProfit = entry.records[0]?.profit ?? 0;
  const [profitInput, setProfitInput] = useState(String(Number(existingProfit) || ""));
  const [profitSaving, setProfitSaving] = useState(false);
  const [profitSavedTick, setProfitSavedTick] = useState(0);

  // Reset profit input when month changes (entry.records depends on year+month)
  useEffect(() => {
    setProfitInput(String(Number(existingProfit) || ""));
  }, [existingProfit, year, month]);

  const totalDistributed = entry.shares.reduce((sum, s) => sum + Number(s.sharePercent), 0);
  const netMyPct = Number(entry.mySharePercent) * (1 - totalDistributed / 100);

  // QAR amounts
  const profit = parseFloat(profitInput) || 0;
  const myCut = (profit * Number(entry.mySharePercent)) / 100;
  const distributedAmount = (myCut * totalDistributed) / 100;
  const myNetAmount = myCut - distributedAmount;

  async function saveProfit() {
    const value = parseFloat(profitInput) || 0;
    setProfitSaving(true);
    const res = await fetch(`/api/income-sources/entries/${entry.id}/record`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, profit: value }),
    });
    setProfitSaving(false);
    if (res.ok) {
      setProfitSavedTick((t) => t + 1);
      onMutated();
    } else {
      const d = await res.json();
      toast(d.error ?? "Couldn't save profit", "error");
    }
  }

  async function saveEdit() {
    setEditLoading(true);
    const res = await fetch(`/api/income-sources/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyName: editName, mySharePercent: parseFloat(editShare) }),
    });
    setEditLoading(false);
    if (res.ok) { setEditing(false); onMutated(); }
    else { const d = await res.json(); toast(d.error ?? "Failed", "error"); }
  }

  async function deleteEntry() {
    if (!confirm(`Remove "${entry.propertyName}"?`)) return;
    const res = await fetch(`/api/income-sources/entries/${entry.id}`, { method: "DELETE" });
    if (res.ok) onMutated();
    else { const d = await res.json(); toast(d.error ?? "Failed", "error"); }
  }

  async function addShareToEntry() {
    if (!newShareHolder || !newSharePct) return;
    setShareLoading(true);
    const res = await fetch(`/api/income-sources/entries/${entry.id}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareholderId: newShareHolder, sharePercent: parseFloat(newSharePct) }),
    });
    setShareLoading(false);
    if (res.ok) {
      setNewShareHolder(""); setNewSharePct(""); setAddShareOpen(false); onMutated();
    } else {
      const d = await res.json(); toast(d.error ?? "Failed", "error");
    }
  }

  async function deleteShare(shareId: string, shareEntryId: string) {
    const res = await fetch(`/api/income-sources/entries/${shareEntryId}/shares/${shareId}`, { method: "DELETE" });
    if (res.ok) onMutated();
    else { const d = await res.json(); toast(d.error ?? "Failed", "error"); }
  }

  const usedShareholderIds = entry.shares.map((s) => s.shareholderId);
  const availableShareholders = shareholders.filter(
    (sh) => !usedShareholderIds.includes(sh.id)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Entry header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Building2 className="h-4 w-4" />
        </div>

        {editing ? (
          <div className="flex-1 min-w-0 flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <input
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Property name"
              />
            </div>
            <div className="w-24 shrink-0">
              <input
                type="number"
                inputMode="decimal"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                value={editShare}
                onChange={(e) => setEditShare(e.target.value)}
                placeholder="%"
                min={0.01} max={100} step={0.01}
              />
            </div>
            <button
              type="button"
              onClick={saveEdit}
              disabled={editLoading}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setEditName(entry.propertyName); setEditShare(String(entry.mySharePercent)); }}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-semibold text-slate-900 truncate">
              {entry.propertyName}
            </p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              My share:{" "}
              <span className="font-semibold text-emerald-700">{pct(entry.mySharePercent)}</span>
              {totalDistributed > 0 && (
                <>
                  {" · "}distributed{" "}
                  <span className="font-semibold text-amber-700">{pct(totalDistributed)}</span>
                  {" · "}I keep{" "}
                  <span className="font-semibold text-slate-800">{netMyPct.toFixed(2)}%</span>
                </>
              )}
            </p>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={deleteEntry}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={expanded ? "Collapse" : "Expand shares"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Profit + breakdown section (always visible) */}
      {!editing && (
        <div className="border-t border-slate-100 px-4 sm:px-5 py-4 bg-emerald-50/30">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-[10.5px] font-bold uppercase tracking-[0.18em] text-emerald-800 mb-1.5">
                Profit received · {MONTHS[month - 1]} {year}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-slate-500 pointer-events-none">QAR</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full h-11 sm:h-10 pl-12 pr-3 rounded-lg border border-emerald-300 bg-white text-[15px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600 tabular-nums"
                    placeholder="0.00"
                    value={profitInput}
                    onChange={(e) => setProfitInput(e.target.value)}
                    onBlur={() => {
                      const newVal = parseFloat(profitInput) || 0;
                      if (newVal !== Number(existingProfit)) saveProfit();
                    }}
                    min={0}
                    step={0.01}
                  />
                </div>
                <Button
                  size="md"
                  variant="primary"
                  onClick={saveProfit}
                  loading={profitSaving}
                  disabled={(parseFloat(profitInput) || 0) === Number(existingProfit)}
                  className="shrink-0"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>
              {profitSavedTick > 0 && (parseFloat(profitInput) || 0) === Number(existingProfit) && Number(existingProfit) > 0 && (
                <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Saved
                </p>
              )}
            </div>
          </div>

          {/* Breakdown — visible when profit > 0 */}
          {profit > 0 && (
            <div className="mt-3 pt-3 border-t border-emerald-200/50">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                Distribution
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="rounded-lg bg-white border border-slate-200/80 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">My total cut ({pct(entry.mySharePercent)})</p>
                  <p className="text-[14px] font-bold text-emerald-700 tabular-nums mt-0.5">{qar(myCut)}</p>
                </div>
                {totalDistributed > 0 && (
                  <div className="rounded-lg bg-white border border-slate-200/80 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Given to others ({pct(totalDistributed)})</p>
                    <p className="text-[14px] font-bold text-amber-700 tabular-nums mt-0.5">{qar(distributedAmount)}</p>
                  </div>
                )}
                <div className="rounded-lg bg-emerald-700 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-200">I keep</p>
                  <p className="text-[14px] font-bold text-white tabular-nums mt-0.5">{qar(myNetAmount)}</p>
                </div>
              </div>
              {entry.shares.length > 0 && (
                <div className="mt-2.5 flex flex-col gap-1">
                  {entry.shares.map((sh) => {
                    const amount = (myCut * Number(sh.sharePercent)) / 100;
                    return (
                      <div key={sh.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
                            {sh.shareholder.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate text-slate-600">{sh.shareholder.name}</span>
                          <span className="text-[11px] text-slate-400">{pct(sh.sharePercent)} of my cut</span>
                        </div>
                        <span className="shrink-0 font-bold text-amber-700 tabular-nums">{qar(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shares section */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 sm:px-5 py-3 bg-slate-50/40">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2.5">
            Shareholder distributions (% of my {pct(entry.mySharePercent)} cut)
          </p>

          {entry.shares.length === 0 && (
            <p className="text-[12.5px] text-slate-400 italic mb-3">
              You keep 100% of your cut — no distributions set.
            </p>
          )}

          {entry.shares.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-3">
              {entry.shares.map((sh) => (
                <div key={sh.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {sh.shareholder.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-medium text-slate-700 truncate">
                      {sh.shareholder.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12.5px] font-semibold text-amber-700">
                      {pct(sh.sharePercent)}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      (={((Number(entry.mySharePercent) * Number(sh.sharePercent)) / 100).toFixed(2)}% of property)
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteShare(sh.id, entry.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add share form */}
          {availableShareholders.length > 0 && !addShareOpen && (
            <button
              type="button"
              onClick={() => setAddShareOpen(true)}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-amber-700 font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add distribution
            </button>
          )}

          {addShareOpen && (
            <div className="flex gap-2 items-end mt-1">
              <select
                className="h-9 flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 cursor-pointer"
                value={newShareHolder}
                onChange={(e) => setNewShareHolder(e.target.value)}
              >
                <option value="">Shareholder…</option>
                {availableShareholders.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="number"
                inputMode="decimal"
                className="h-9 w-24 shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                placeholder="% of cut"
                value={newSharePct}
                onChange={(e) => setNewSharePct(e.target.value)}
                min={0.01} max={100} step={0.01}
              />
              <button
                type="button"
                disabled={!newShareHolder || !newSharePct || shareLoading}
                onClick={addShareToEntry}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { setAddShareOpen(false); setNewShareHolder(""); setNewSharePct(""); }}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function IncomeSourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
  }

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: "", phone: "", notes: "" });
  const [infoLoading, setInfoLoading] = useState(false);

  const { data: source, isLoading } = useQuery<SourceDetail>({
    queryKey: ["income-source", id, year, month],
    queryFn: async () => {
      const res = await fetch(`/api/income-sources/${id}?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: shareholders } = useQuery<ShareholderOption[]>({
    queryKey: ["shareholders"],
    queryFn: async () => {
      const res = await fetch("/api/shareholders");
      return res.json();
    },
    staleTime: 60_000,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["income-source", id] });
    qc.invalidateQueries({ queryKey: ["income-sources"] });
    qc.invalidateQueries({ queryKey: ["holdings"] });
  }

  function startEditInfo() {
    if (!source) return;
    setInfoForm({ name: source.name, phone: source.phone ?? "", notes: source.notes ?? "" });
    setEditingInfo(true);
  }

  async function saveInfo() {
    setInfoLoading(true);
    const res = await fetch(`/api/income-sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: infoForm.name, phone: infoForm.phone || undefined, notes: infoForm.notes || undefined }),
    });
    setInfoLoading(false);
    if (res.ok) { setEditingInfo(false); invalidate(); }
    else { const d = await res.json(); toast(d.error ?? "Failed", "error"); }
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#faf7f1] px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="h-3.5 w-24 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-5 space-y-3">
          <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-full bg-[#faf7f1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-3">Source not found.</p>
          <Link href="/income-sources"><Button variant="secondary">Back</Button></Link>
        </div>
      </div>
    );
  }

  const totalEntries = source.entries.length;

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/income-sources"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          Income Sources
        </Link>

        {/* Source info card */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mb-5">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[16px]">
                {source.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-slate-900 truncate">
                  {source.name}
                </h1>
                <div className="flex flex-wrap gap-x-3 mt-0.5">
                  {source.phone && (
                    <span className="flex items-center gap-1 text-[12px] text-slate-500">
                      <Phone className="h-3 w-3" /> {source.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[12px] text-slate-500">
                    <Building2 className="h-3 w-3" />
                    {totalEntries} {totalEntries === 1 ? "property" : "properties"}
                  </span>
                </div>
              </div>
            </div>
            {!editingInfo && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/api/pdf/income-source/${id}?year=${year}&month=${month}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-emerald-700 font-medium transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-emerald-50"
                  title="Download PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </a>
                <button
                  type="button"
                  onClick={startEditInfo}
                  className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-amber-700 font-medium transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-amber-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit info form */}
          {editingInfo && (
            <div className="px-5 sm:px-6 py-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Name"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
                <Input
                  label="Phone"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+974 5555 5555"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold tracking-wide uppercase text-slate-600 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={infoForm.notes}
                  onChange={(e) => setInfoForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingInfo(false)}>Cancel</Button>
                <Button size="sm" loading={infoLoading} onClick={saveInfo}>Save</Button>
              </div>
            </div>
          )}

          {/* Notes display */}
          {!editingInfo && source.notes && (
            <div className="px-5 sm:px-6 py-3 bg-slate-50/60 text-[13px] text-slate-600 border-t border-slate-100">
              {source.notes}
            </div>
          )}
        </div>

        {/* Month picker */}
        <div className="mb-4 rounded-xl bg-white border border-slate-200/80 shadow-card px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-11 w-11 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0 overflow-x-auto">
              <div className="inline-flex h-11 sm:h-9 items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
                {MONTHS_SHORT.map((m, i) => {
                  const value = i + 1;
                  const active = value === month;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonth(value)}
                      className={
                        "h-full px-3.5 sm:px-2.5 rounded-md text-[13px] sm:text-[12px] font-semibold transition-colors cursor-pointer min-w-[44px] sm:min-w-[40px] " +
                        (active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 active:bg-slate-200")
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
              className="flex h-11 w-11 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[12px] text-slate-500 mt-2">
            Showing profits for <span className="font-semibold text-slate-900">{MONTHS[month - 1]} {year}</span>
          </p>
        </div>

        {/* Properties section */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <h2 className="text-[14px] font-semibold text-slate-900">Properties &amp; Profits</h2>
            {totalEntries > 0 && (
              <Badge variant="info">{totalEntries}</Badge>
            )}
          </div>
          <p className="text-[11.5px] text-slate-400 hidden sm:block">Enter profit, see your cut</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {source.entries.map((entry) => (
            <EntryCard
              key={`${entry.id}-${year}-${month}`}
              entry={entry}
              year={year}
              month={month}
              shareholders={shareholders ?? []}
              onMutated={invalidate}
            />
          ))}

          <AddEntryForm
            sourceId={id}
            shareholders={shareholders ?? []}
            onSaved={invalidate}
          />
        </div>
      </div>
    </div>
  );
}
