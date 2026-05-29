"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewShareholderPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/shareholders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      await qc.invalidateQueries({ queryKey: ["shareholders"] });
      toast("Shareholder added");
      router.push("/shareholders");
    } else {
      const data = await res.json();
      toast(data.error ?? "Failed to create shareholder", "error");
    }
  }

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-xl mx-auto">
        <Link
          href="/shareholders"
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 mb-5 sm:mb-6 transition-colors min-h-[36px]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Shareholders
        </Link>

        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex h-11 w-11 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-slate-900">
              Add Shareholder
            </h1>
            <p className="text-[12.5px] sm:text-[13px] text-slate-500">
              Create a new shareholder before assigning them to villas.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card">
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
            <Input
              id="name"
              label="Full name"
              placeholder="Ahmed Al-Rashid"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              autoFocus
              autoComplete="name"
            />
            <Input
              id="phone"
              label="Phone (optional)"
              type="tel"
              inputMode="tel"
              placeholder="+974 5000 0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
            />
            <Input
              id="email"
              label="Email (optional)"
              type="email"
              placeholder="ahmed@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <Link href="/shareholders" className="w-full sm:w-auto">
                <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
                Add Shareholder
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
