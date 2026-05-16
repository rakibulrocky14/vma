"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  UserCog,
  Plus,
  Trash2,
  ShieldCheck,
  User2,
  Calendar,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";
import { format } from "date-fns";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER";
  createdAt: string;
};

function RoleBadge({ role }: { role: AppUser["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        role === "ADMIN"
          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      )}
    >
      {role === "ADMIN" && <ShieldCheck className="h-3 w-3" />}
      {role === "ADMIN" ? "Admin" : "Manager"}
    </span>
  );
}

function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white shadow-sm",
        size === "md" ? "h-10 w-10 text-[15px]" : "h-8 w-8 text-[13px]"
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const emptyForm = { name: "", email: "", password: "", role: "MANAGER" as AppUser["role"] };

export default function UsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isAdmin = session?.user?.role === "ADMIN";
  const currentUserId = session?.user?.id;

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  // ── data fetching ──────────────────────────────────────
  const { data: users = [], isLoading } = useQuery<AppUser[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: isAdmin === true,
  });

  // ── mutations ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(
        data.error?.fieldErrors
          ? Object.values(data.error.fieldErrors).flat().join(", ")
          : (data.error ?? "Failed to create user")
      );
      return data as AppUser;
    },
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setShowCreate(false);
      setForm(emptyForm);
      setShowPassword(false);
      toast(`${user.name} has been added`, "success");
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast(`${deleteTarget?.name} has been removed`, "success");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required");
    if (!form.email.trim()) return setFormError("Email is required");
    if (form.password.length < 6) return setFormError("Password must be at least 6 characters");
    createMutation.mutate(form);
  }

  // ── access guard ───────────────────────────────────────
  if (!isAdmin) {
    // session may still be hydrating — only show denied if we're sure
    if (session === undefined) return <PageSpinner />;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ShieldCheck className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">Admin access required</p>
          <p className="text-[13px] text-slate-500 mt-1">
            Only administrators can manage user accounts.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-amber-700 mb-1">
            Administration
          </p>
          <h1 className="font-display text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 leading-tight">
            Users
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Manage who can access this system.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreate(true);
            setForm(emptyForm);
            setFormError("");
            setShowPassword(false);
          }}
          size="md"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Users list */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <User2 className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">No users yet</p>
          <p className="text-[13px] text-slate-500">Add the first account to get started.</p>
          <Button size="sm" onClick={() => setShowCreate(true)} className="mt-1">
            <Plus className="h-3.5 w-3.5" /> Add User
          </Button>
        </div>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-card border border-slate-200/80 overflow-hidden">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 uppercase tracking-wide text-[11px]">User</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 uppercase tracking-wide text-[11px]">Role</th>
                  <th className="text-left py-3 px-5 font-semibold text-slate-500 uppercase tracking-wide text-[11px]">Joined</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {user.name}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-[11px] font-medium text-slate-400">(you)</span>
                            )}
                          </p>
                          <p className="text-[12px] text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5"><RoleBadge role={user.role} /></td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {format(new Date(user.createdAt), "d MMM yyyy")}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {user.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Delete ${user.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/40">
              <p className="text-[12px] text-slate-400">
                {users.length} {users.length === 1 ? "user" : "users"} total
              </p>
            </div>
          </div>

          {/* mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-card px-4 py-4 flex items-center gap-3"
              >
                <UserAvatar name={user.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[14px] text-slate-900 truncate">{user.name}</p>
                    {user.id === currentUserId && (
                      <span className="text-[11px] text-slate-400">(you)</span>
                    )}
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="text-[12px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {format(new Date(user.createdAt), "d MMM yyyy")}
                  </p>
                </div>
                {user.id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(user)}
                    aria-label={`Delete ${user.name}`}
                    className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Add User dialog ── */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            id="u-name"
            label="Full Name"
            placeholder="e.g. Ahmed Al-Rashid"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
            autoComplete="name"
          />
          <Input
            id="u-email"
            label="Email"
            type="email"
            placeholder="user@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            inputMode="email"
            autoComplete="email"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wide uppercase text-slate-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                className="h-11 sm:h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 pr-10 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="text-[11px] font-medium">{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold tracking-wide uppercase text-slate-600">
              Role
            </label>
            <div className="relative">
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AppUser["role"] }))}
                className="h-11 sm:h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 pr-9 text-[16px] sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 transition-shadow cursor-pointer"
              >
                <option value="MANAGER">Manager — creates and manages their own villas</option>
                <option value="ADMIN">Admin — sees all villas + user management</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {formError && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-[13px] text-red-800">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending} className="flex-1">
              <UserCog className="h-4 w-4" />
              Create User
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove User">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <TriangleAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                Remove {deleteTarget?.name}?
              </p>
              <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                This will permanently delete their account. They won&apos;t be able to log in.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
