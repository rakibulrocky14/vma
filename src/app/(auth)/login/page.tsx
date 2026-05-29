"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-dvh bg-[#faf7f1] safe-x">
      {/* Left hero panel — desktop only */}
      <div className="hidden lg:flex flex-col flex-1 bg-ink-rich text-white p-12 relative overflow-hidden">
        {/* Brand — pinned top */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white overflow-hidden p-1">
            <Image
              src="/logo.png"
              alt="VMA"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-tight">Villa Management</p>
            <p className="text-[10px] uppercase tracking-widest text-amber-400/80">Doha · Qatar</p>
          </div>
        </div>

        {/* Hero copy — grows to fill space, content vertically centred */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-md">
            <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-400 mb-4">
              Property Operations
            </p>
            <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-tight">
              Manage your villas, rents, and shareholders in one place.
            </h1>
            <p className="text-[15px] text-slate-400 mt-5 leading-relaxed">
              Track monthly collections, expenses, and profit distribution across all your
              properties. Export professional PDF reports for owners.
            </p>
          </div>
        </div>

        {/* Footer — natural bottom of flex column, never overlaps */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500">
          <span>QAR · Calendar months · Manual close</span>
          <span className="tracking-widest">v1.0</span>
        </div>

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center px-5 sm:px-8 py-8 safe-top safe-bottom">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden mb-7 sm:mb-8 text-center">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden p-2">
              <Image
                src="/logo.png"
                alt="VMA"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <p className="text-[16px] font-bold tracking-tight text-slate-900">Villa Management</p>
            <p className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-amber-700 mt-0.5">
              Doha · Qatar
            </p>
          </div>

          <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-700 mb-2">
            Sign in
          </p>
          <h2 className="font-display text-[28px] sm:text-[30px] font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="text-[13px] text-slate-500 mt-1.5 mb-6 sm:mb-8">
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              inputMode="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-[13px] text-red-800">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-7 sm:mt-8 text-center text-[11px] text-slate-400">
            Need access? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
