"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Mail, User as UserIcon, Lock, ShieldCheck } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER";
}

export default function ProfilePage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { update: updateSession } = useSession();

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const [name, setName] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const saveNameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      await updateSession();
      toast("Profile updated");
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwords.next !== passwords.confirm) {
        throw new Error("New passwords don't match");
      }
      if (passwords.next.length < 8) {
        throw new Error("New password must be at least 8 characters");
      }
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Change failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setPasswords({ current: "", next: "", confirm: "" });
      toast("Password changed successfully");
    },
    onError: (err: Error) => toast(err.message, "error"),
  });

  if (isLoading || !profile) return <PageSpinner />;

  const nameChanged = name.trim() !== profile.name && name.trim().length > 0;
  const canChangePassword =
    passwords.current.length > 0 &&
    passwords.next.length >= 8 &&
    passwords.confirm.length > 0;

  return (
    <div className="min-h-full bg-[#faf7f1]">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-7 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 sm:w-8 bg-amber-700" />
            <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] font-bold text-amber-800">
              Account
            </p>
          </div>
          <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[44px] leading-none font-black tracking-[-0.02em] text-slate-950">
            My Profile
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-600 mt-2 sm:mt-3 max-w-xl">
            Your account details and password.
          </p>
        </div>

        {/* Account info card */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card mb-5">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Account details
              </h2>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Update your display name.
              </p>
            </div>
            {profile.role === "ADMIN" ? (
              <Badge variant="warning">
                <ShieldCheck className="h-3 w-3 inline -mt-0.5 mr-0.5" />
                Admin
              </Badge>
            ) : (
              <Badge variant="default">Manager</Badge>
            )}
          </div>

          <div className="px-5 sm:px-6 py-5 flex flex-col gap-5">
            <Input
              id="name"
              label="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              hint="Shown in the sidebar, reports, and shareholder records."
            />

            <div>
              <label className="text-[12px] font-semibold tracking-wide uppercase text-slate-600 block mb-1.5">
                Email
              </label>
              <div className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 flex items-center gap-2 text-[14px] text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1.5">
                Email can&apos;t be changed. Contact an admin if you need a new account.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => saveNameMutation.mutate()}
                loading={saveNameMutation.isPending}
                disabled={!nameChanged}
                size="lg"
                className="w-full sm:w-auto"
              >
                <UserIcon className="h-4 w-4" />
                Save name
              </Button>
            </div>
          </div>
        </div>

        {/* Password card */}
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card">
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Change password
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              At least 8 characters. You&apos;ll need your current password to make a change.
            </p>
          </div>

          <div className="px-5 sm:px-6 py-5 flex flex-col gap-4">
            <Input
              id="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, current: e.target.value }))
              }
              placeholder="••••••••"
            />
            <Input
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, next: e.target.value }))
              }
              placeholder="At least 8 characters"
              hint="Use a strong, unique password."
            />
            <Input
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirm: e.target.value }))
              }
              placeholder="Repeat new password"
            />

            {passwords.next.length > 0 &&
              passwords.confirm.length > 0 &&
              passwords.next !== passwords.confirm && (
                <p className="text-[12px] font-medium text-red-600">
                  Passwords don&apos;t match.
                </p>
              )}

            <div className="flex justify-end pt-1">
              <Button
                onClick={() => changePasswordMutation.mutate()}
                loading={changePasswordMutation.isPending}
                disabled={
                  !canChangePassword ||
                  passwords.next !== passwords.confirm
                }
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Lock className="h-4 w-4" />
                Change password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
