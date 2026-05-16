"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Plus, Trash2, AlertCircle, Building2, Users } from "lucide-react";
import Link from "next/link";

interface ShareholderRow {
  shareholderId: string;
  percentage: string;
}

interface ShareholderOption {
  id: string;
  name: string;
}

export default function NewVillaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ villaNumber: "", address: "", totalRooms: "" });
  const [shareholders, setShareholders] = useState<ShareholderRow[]>([
    { shareholderId: "", percentage: "" },
  ]);

  const { data: allShareholders } = useQuery<ShareholderOption[]>({
    queryKey: ["shareholders"],
    queryFn: async () => {
      const res = await fetch("/api/shareholders");
      return res.json();
    },
  });

  const totalPct = shareholders.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
  const pctOk = Math.abs(totalPct - 100) < 0.01;
  const pctDiff = 100 - totalPct;

  function addRow() {
    setShareholders((prev) => [...prev, { shareholderId: "", percentage: "" }]);
  }
  function removeRow(i: number) {
    setShareholders((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, field: keyof ShareholderRow, value: string) {
    setShareholders((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pctOk) return;
    setLoading(true);

    const res = await fetch("/api/villas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        villaNumber: form.villaNumber,
        address: form.address,
        totalRooms: parseInt(form.totalRooms),
        shareholders: shareholders
          .filter((s) => s.shareholderId && s.percentage)
          .map((s) => ({
            shareholderId: s.shareholderId,
            percentage: parseFloat(s.percentage),
          })),
      }),
    });

    setLoading(false);

    if (res.ok) {
      const villa = await res.json();
      toast("Villa created");
      router.push(`/villas/${villa.id}`);
    } else {
      const data = await res.json();
      toast(data.error ?? "Failed to create villa", "error");
    }
  }

  const usedIds = shareholders.map((s) => s.shareholderId).filter(Boolean);
  const noShareholders = allShareholders?.length === 0;

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-slate-900">
              Create Villa
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-500">
              Add a new property with rooms and shareholders.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Villa details */}
          <section className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">
                Property details
              </h2>
            </div>
            <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="villaNumber"
                  label="Villa number"
                  placeholder="V-12"
                  value={form.villaNumber}
                  onChange={(e) => setForm((p) => ({ ...p, villaNumber: e.target.value }))}
                  required
                  autoFocus
                />
                <Input
                  id="totalRooms"
                  label="Total rooms"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100}
                  placeholder="6"
                  value={form.totalRooms}
                  onChange={(e) => setForm((p) => ({ ...p, totalRooms: e.target.value }))}
                  required
                  hint="Rooms will be numbered R1, R2, …"
                />
              </div>
              <Input
                id="address"
                label="Address"
                placeholder="Villa 12, Al Rayyan, Doha"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                required
              />
            </div>
          </section>

          {/* Shareholders */}
          <section className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">
                  Shareholders
                </h2>
              </div>
              <Badge variant={pctOk ? "success" : "warning"}>
                {totalPct.toFixed(2)}% {pctOk ? "✓" : `(${pctDiff > 0 ? "+" : ""}${pctDiff.toFixed(2)} to go)`}
              </Badge>
            </div>

            <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
              {noShareholders && (
                <div className="flex items-start gap-2.5 rounded-md bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-900">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    No shareholders yet.{" "}
                    <Link href="/shareholders/new" className="underline font-semibold">
                      Add one first
                    </Link>
                    , then come back here.
                  </span>
                </div>
              )}

              {shareholders.map((row, i) => (
                <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/40 p-3 sm:p-0 sm:bg-transparent sm:border-0">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="flex-1 min-w-0">
                      <label className="text-[12px] font-semibold tracking-wide uppercase text-slate-600 block mb-1.5">
                        Shareholder
                      </label>
                      <select
                        className="h-11 sm:h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[15px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 cursor-pointer"
                        value={row.shareholderId}
                        onChange={(e) => updateRow(i, "shareholderId", e.target.value)}
                        required
                      >
                        <option value="">Select...</option>
                        {allShareholders
                          ?.filter(
                            (s) => !usedIds.includes(s.id) || s.id === row.shareholderId
                          )
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex gap-2 sm:gap-3 items-end">
                      <div className="flex-1 sm:w-32 sm:flex-initial">
                        <Input
                          label="Share %"
                          type="number"
                          inputMode="decimal"
                          min={0.01}
                          max={100}
                          step={0.01}
                          placeholder="50.00"
                          value={row.percentage}
                          onChange={(e) => updateRow(i, "percentage", e.target.value)}
                          required
                        />
                      </div>
                      {shareholders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="mb-0.5 flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center text-slate-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Remove"
                          aria-label="Remove shareholder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={addRow}
                className="self-start"
              >
                <Plus className="h-4 w-4" />
                Add shareholder
              </Button>

              <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2.5 text-[12.5px] text-slate-600">
                Shares must total exactly <strong>100%</strong> — currently{" "}
                <span className="font-mono font-bold">{totalPct.toFixed(2)}%</span>.
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={loading}
              disabled={!pctOk}
              size="lg"
              className="w-full sm:w-auto"
            >
              Create Villa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
