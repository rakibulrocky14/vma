"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, Plus, Phone, Mail, Building2, Trash2, ArrowRight, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

interface ShareholderRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  villas: { villa: { id: string; villaNumber: string } }[];
}

export default function ShareholdersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data: shareholders, isLoading } = useQuery<ShareholderRow[]>({
    queryKey: ["shareholders"],
    queryFn: async () => {
      const res = await fetch("/api/shareholders");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shareholders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareholders"] });
      toast("Shareholder deleted");
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const list = shareholders ?? [];
  const filtered = query
    ? list.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email?.toLowerCase().includes(query.toLowerCase()) ||
          s.phone?.includes(query)
      )
    : list;

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
        <div className="flex items-start sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 sm:w-8 bg-amber-700" />
              <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
                Directory
              </p>
            </div>
            <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
              Shareholders
            </h1>
            <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3">
              {isLoading ? (
                <span className="inline-block h-3.5 w-32 rounded bg-slate-200 animate-pulse align-middle" />
              ) : (
                <>
                  <span className="font-semibold text-slate-900">{list.length}</span>{" "}
                  {list.length === 1 ? "person" : "people"} in your directory
                </>
              )}
            </p>
          </div>
          <Link href="/shareholders/new" className="shrink-0">
            <Button size="lg">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Shareholder</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </Link>
        </div>

        {/* Search */}
        {(isLoading || list.length > 0) && (
          <div className="relative mb-4 sm:mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name, email, or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-[14px] sm:text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 disabled:opacity-50"
            />
          </div>
        )}

        {/* Skeleton rows while loading */}
        {isLoading && (
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-slate-200/80 shadow-card px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3"
              >
                <div className="h-11 w-11 sm:h-10 sm:w-10 shrink-0 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 w-2/5 rounded bg-slate-200 animate-pulse" />
                  <div className="h-2.5 w-1/4 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-5 w-14 rounded-full bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && list.length === 0 && (
          <div className="text-center py-16 sm:py-24 rounded-xl border border-dashed border-slate-300 bg-white px-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
              <Users className="h-7 w-7 text-amber-700" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-900">No shareholders yet</p>
            <p className="text-[13px] sm:text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
              Add shareholders before assigning them to villas.
            </p>
            <Link href="/shareholders/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add first shareholder
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && filtered.length === 0 && list.length > 0 && (
          <div className="text-center py-12 rounded-xl border border-slate-200 bg-white">
            <p className="text-[13px] text-slate-500">No matches for &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {!isLoading && <div className="flex flex-col gap-2 sm:gap-2.5">
          {filtered.map((s) => (
            <article
              key={s.id}
              className="group rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 active:bg-slate-50/40 transition-all"
            >
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4">
                <Link
                  href={`/shareholders/${s.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-[15px] sm:text-[14px]">
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
                      {s.email && (
                        <span className="flex items-center gap-1 text-[11.5px] text-slate-500 truncate max-w-[180px] sm:max-w-none">
                          <Mail className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </span>
                      )}
                      {!s.phone && !s.email && (
                        <span className="text-[11.5px] text-slate-400 italic">
                          No contact info
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {s.villas.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Building2 className="h-3 w-3" />
                      <span>
                        {s.villas.map((v) => v.villa.villaNumber).join(", ")}
                      </span>
                    </div>
                  )}
                  <Badge variant={s.villas.length > 0 ? "info" : "default"}>
                    {s.villas.length}
                    <span className="hidden sm:inline ml-1">
                      {s.villas.length === 1 ? "villa" : "villas"}
                    </span>
                  </Badge>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      if (confirm(`Delete ${s.name}? They must not be linked to any villas.`))
                        deleteMutation.mutate(s.id);
                    }}
                    className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <Link href={`/shareholders/${s.id}`} className="hidden sm:block">
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>}
      </div>
    </div>
  );
}
