"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Plus,
  Phone,
  ArrowRight,
  Trash2,
  Search,
  Building2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

interface IncomeSourceRow {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  entries: {
    id: string;
    propertyName: string;
    mySharePercent: number;
    shares: { id: string; sharePercent: number }[];
  }[];
}

/* ─── Add Source dialog ───────────────────────────────────── */
function AddSourceDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (source: IncomeSourceRow) => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/income-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone || undefined, notes: form.notes || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      const src = await res.json();
      onCreated(src);
      setForm({ name: "", phone: "", notes: "" });
    } else {
      const d = await res.json();
      toast(d.error ?? "Failed to create", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold tracking-tight text-slate-900">Add income source</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">Add a person or entity you receive income from.</p>
        </div>
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 flex flex-col gap-4">
          <Input
            id="src-name"
            label="Name"
            placeholder="Ali Al-Malik"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            autoFocus
          />
          <Input
            id="src-phone"
            label="Phone (optional)"
            type="tel"
            inputMode="tel"
            placeholder="+974 5555 5555"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <div>
            <label className="block text-[12px] font-semibold tracking-wide uppercase text-slate-600 mb-1.5" htmlFor="src-notes">
              Notes (optional)
            </label>
            <textarea
              id="src-notes"
              rows={2}
              placeholder="Any notes about this source…"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Add Source</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function IncomeSourcesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data: sources, isLoading } = useQuery<IncomeSourceRow[]>({
    queryKey: ["income-sources"],
    queryFn: async () => {
      const res = await fetch("/api/income-sources");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/income-sources/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["income-sources"] });
      toast("Source deleted");
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const list = sources ?? [];
  const filtered = query
    ? list.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.phone?.includes(query)
      )
    : list;

  function handleCreated(src: IncomeSourceRow) {
    qc.setQueryData<IncomeSourceRow[]>(["income-sources"], (prev) =>
      prev ? [src as IncomeSourceRow, ...prev] : [src as IncomeSourceRow]
    );
    toast("Source added — add properties to it now");
    setAddOpen(false);
  }

  const totalEntries = list.reduce((sum, s) => sum + s.entries.length, 0);

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 sm:w-8 bg-amber-700" />
              <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
                External Income
              </p>
            </div>
            <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
              Income Sources
            </h1>
            <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3">
              {isLoading ? (
                <span className="inline-block h-3.5 w-40 rounded bg-slate-200 animate-pulse align-middle" />
              ) : (
                <>
                  <span className="font-semibold text-slate-900">{list.length}</span>{" "}
                  {list.length === 1 ? "source" : "sources"},{" "}
                  <span className="font-semibold text-slate-900">{totalEntries}</span>{" "}
                  {totalEntries === 1 ? "property" : "properties"} tracked
                </>
              )}
            </p>
          </div>
          <Button size="lg" onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add Source</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Search */}
        {(isLoading || list.length > 0) && (
          <div className="relative mb-4 sm:mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-[14px] sm:text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 disabled:opacity-50"
            />
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-slate-200/80 shadow-card px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3"
              >
                <div className="h-11 w-11 sm:h-10 sm:w-10 shrink-0 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-1/4 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && list.length === 0 && (
          <div className="text-center py-16 sm:py-24 rounded-xl border border-dashed border-slate-300 bg-white px-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <TrendingUp className="h-7 w-7 text-amber-700" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-900">No income sources yet</p>
            <p className="text-[13px] sm:text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
              Add people or entities you receive income from, then track each property and your share.
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add first source
            </Button>
          </div>
        )}

        {/* No search results */}
        {!isLoading && filtered.length === 0 && list.length > 0 && (
          <div className="text-center py-12 rounded-xl border border-slate-200 bg-white">
            <p className="text-[13px] text-slate-500">No matches for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {/* List */}
        {!isLoading && (
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {filtered.map((s) => {
              const totalMyShare = s.entries.reduce((sum, e) => sum + Number(e.mySharePercent), 0);
              return (
                <article
                  key={s.id}
                  className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 active:bg-slate-50/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4">
                    <Link
                      href={`/income-sources/${s.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[15px] sm:text-[14px]">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] sm:text-[14.5px] font-semibold text-slate-900 truncate">
                          {s.name}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {s.phone && (
                            <span className="flex items-center gap-1 text-[11.5px] text-slate-500">
                              <Phone className="h-2.5 w-2.5" /> {s.phone}
                            </span>
                          )}
                          {s.entries.length > 0 && (
                            <span className="flex items-center gap-1 text-[11.5px] text-slate-500">
                              <Building2 className="h-2.5 w-2.5" />
                              {s.entries.length} {s.entries.length === 1 ? "property" : "properties"}
                            </span>
                          )}
                          {!s.phone && s.entries.length === 0 && (
                            <span className="text-[11.5px] text-slate-400 italic">
                              No properties added yet
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {s.entries.length > 0 && (
                        <Badge variant="success">
                          {totalMyShare.toFixed(0)}%
                          <span className="hidden sm:inline ml-1">avg share</span>
                        </Badge>
                      )}
                      {s.entries.length === 0 && (
                        <Badge variant="default">
                          0
                          <span className="hidden sm:inline ml-1">properties</span>
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          if (confirm(`Delete "${s.name}"? This will also remove all their properties and shares.`))
                            deleteMutation.mutate(s.id);
                        }}
                        className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </button>
                      <Link href={`/income-sources/${s.id}`} className="hidden sm:block">
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <AddSourceDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
