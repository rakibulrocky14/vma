"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Upload, Building2, Lock } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const [form, setForm] = useState({ companyName: "", address: "" });
  const [uploading, setUploading] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({ companyName: settings.companyName ?? "", address: settings.address ?? "" });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast("Settings saved");
    },
    onError: () => toast("Save failed", "error"),
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast("Logo uploaded");
    } else {
      toast("Upload failed", "error");
    }
  }

  if (isLoading || sessionStatus === "loading") return <PageSpinner />;

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-[#faf7f1] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl bg-white border border-slate-200/80 shadow-card p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-slate-500" />
          </div>
          <h1 className="text-[18px] font-bold text-slate-900 mb-2">Admin only</h1>
          <p className="text-[13px] text-slate-600 mb-5">
            App Settings are restricted to administrators. To update your own details, head to your profile.
          </p>
          <Link href="/profile">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              Go to My Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
        <div className="mb-7 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-8 bg-amber-700" />
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
              Workspace
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
            Settings
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3 max-w-xl">
            Branding and information that appears on every PDF report you export.
          </p>
        </div>

        {/* Branding card */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Company branding
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Shown in the header of every PDF report.
            </p>
          </div>

          <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden self-start">
                {settings?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="h-9 w-9 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] uppercase tracking-wide font-semibold text-slate-600 mb-1">
                  Logo
                </p>
                <p className="text-[12.5px] text-slate-500 mb-3">
                  PNG or SVG. Square, ideally 200×200.
                </p>
                <label className="inline-flex items-center gap-1.5 min-h-[40px] h-10 px-4 rounded-lg border border-slate-200 bg-white text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : settings?.logoUrl ? "Replace logo" : "Upload logo"}
                </label>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <Input
              id="companyName"
              label="Company name"
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="Villa Management Co."
              hint="Shown at the top of every PDF."
            />
            <Input
              id="address"
              label="Address"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Doha, Qatar"
              hint="Shown under your company name on PDFs."
            />

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => saveMutation.mutate()}
                loading={saveMutation.isPending}
                size="lg"
                className="w-full sm:w-auto"
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
