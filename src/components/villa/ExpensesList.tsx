"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Pencil, Check, X, Receipt } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: unknown;
}

interface Props {
  villaId: string;
  year: number;
  month: number;
  expenses: Expense[];
  isClosed: boolean;
  onChanged: () => void;
}

export function ExpensesList({ villaId, year, month, expenses, isClosed, onChanged }: Props) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ description: "", amount: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", amount: "" });

  const invalidate = () => onChanged();

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/villas/${villaId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          description: addForm.description,
          amount: parseFloat(addForm.amount),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
    },
    onSuccess: () => {
      invalidate();
      setAdding(false);
      setAddForm({ description: "", amount: "" });
      toast("Expense added");
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editForm.description,
          amount: parseFloat(editForm.amount),
        }),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast("Expense updated");
    },
    onError: () => toast("Update failed", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      invalidate();
      toast("Expense removed");
    },
    onError: () => toast("Delete failed", "error"),
  });

  const total = expenses.reduce((sum, e) => sum + parseDecimal(e.amount), 0);
  const canAdd = !isClosed && !adding;

  // Empty state
  if (expenses.length === 0 && !adding) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
          <Receipt className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-[14px] font-semibold text-slate-800">No expenses recorded</p>
        <p className="text-[12.5px] text-slate-500 mt-1">
          {isClosed ? "This month is closed." : "Add expenses like maintenance or utilities."}
        </p>
        {canAdd && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 h-10 rounded-md border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add expense
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* === MOBILE: card list === */}
      <div className="md:hidden divide-y divide-slate-100">
        {expenses.map((e) => (
          <div key={e.id} className="px-4 py-3">
            {editing === e.id ? (
              <div className="space-y-2.5">
                <input
                  autoFocus
                  placeholder="Description"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                  value={editForm.description}
                  onChange={(ev) => setEditForm((p) => ({ ...p, description: ev.target.value }))}
                />
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    className="w-full h-11 rounded-lg border border-slate-200 pl-3 pr-14 text-[16px] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                    value={editForm.amount}
                    onChange={(ev) => setEditForm((p) => ({ ...p, amount: ev.target.value }))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    QAR
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => updateMutation.mutate(e.id)}
                    loading={updateMutation.isPending}
                    className="flex-1 !h-10"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(null)}
                    className="!h-10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-slate-800 truncate">
                    {e.description}
                  </p>
                  <p className="text-[15px] font-mono tabular-nums font-bold text-red-700 mt-0.5">
                    {formatQAR(parseDecimal(e.amount))}
                  </p>
                </div>
                {!isClosed && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(e.id);
                        setEditForm({
                          description: e.description,
                          amount: String(parseDecimal(e.amount)),
                        });
                      }}
                      aria-label="Edit"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 active:bg-amber-50 active:text-amber-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${e.description}"?`)) deleteMutation.mutate(e.id);
                      }}
                      aria-label="Delete"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 active:bg-red-50 active:text-red-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="px-4 py-3 bg-amber-50/40 space-y-2.5">
            <input
              autoFocus
              placeholder="Description (e.g. AC repair)"
              className="w-full h-11 rounded-lg border border-amber-200 px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
              value={addForm.description}
              onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                step={0.01}
                placeholder="0.00"
                className="w-full h-11 rounded-lg border border-amber-200 pl-3 pr-14 text-[16px] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                value={addForm.amount}
                onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && addForm.description && addForm.amount) {
                    addMutation.mutate();
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                QAR
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => addMutation.mutate()}
                loading={addMutation.isPending}
                disabled={!addForm.description || !addForm.amount}
                className="flex-1 !h-10"
              >
                <Check className="h-3.5 w-3.5" />
                Add
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setAdding(false);
                  setAddForm({ description: "", amount: "" });
                }}
                className="!h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* === DESKTOP: table === */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-900">
              <th className="text-left px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                Description
              </th>
              <th className="text-right px-4 py-2.5 font-semibold text-[10.5px] uppercase tracking-wider text-slate-300">
                Amount
              </th>
              {!isClosed && <th className="w-16" />}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr
                key={e.id}
                className={
                  "border-b border-slate-100 last:border-0 transition-colors " +
                  (i % 2 === 1 ? "bg-slate-50/40 " : "") +
                  "hover:bg-amber-50/40"
                }
              >
                <td className="px-4 py-2">
                  {editing === e.id ? (
                    <input
                      autoFocus
                      className="w-full border border-slate-200 rounded-md px-2.5 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                      value={editForm.description}
                      onChange={(ev) => setEditForm((p) => ({ ...p, description: ev.target.value }))}
                    />
                  ) : (
                    <span className="text-[13px] text-slate-800">{e.description}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {editing === e.id ? (
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.01}
                      className="w-32 text-right border border-slate-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600"
                      value={editForm.amount}
                      onChange={(ev) => setEditForm((p) => ({ ...p, amount: ev.target.value }))}
                    />
                  ) : (
                    <span className="font-mono tabular-nums text-[13px] font-semibold text-red-700">
                      {formatQAR(parseDecimal(e.amount))}
                    </span>
                  )}
                </td>
                {!isClosed && (
                  <td className="px-2 py-2">
                    <div className="flex gap-0.5 justify-end">
                      {editing === e.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate(e.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md cursor-pointer"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(e.id);
                              setEditForm({
                                description: e.description,
                                amount: String(parseDecimal(e.amount)),
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-md cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete "${e.description}"?`)) deleteMutation.mutate(e.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {adding && (
              <tr className="bg-amber-50/40 border-b border-amber-100/60">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    placeholder="Description (e.g. AC repair)"
                    className="w-full border border-amber-200 rounded-md px-2.5 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                    value={addForm.description}
                    onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                    className="w-full text-right border border-amber-200 rounded-md px-2.5 py-1 text-[13px] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600 bg-white"
                    value={addForm.amount}
                    onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && addForm.description && addForm.amount) {
                        addMutation.mutate();
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-0.5 justify-end">
                    <button
                      type="button"
                      onClick={() => addMutation.mutate()}
                      disabled={!addForm.description || !addForm.amount}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Add"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdding(false);
                        setAddForm({ description: "", amount: "" });
                      }}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr className="bg-amber-50/60 border-t-2 border-slate-200">
                <td className="px-4 py-2.5 font-bold text-[12px] uppercase tracking-wider text-slate-700">
                  Total Expenses
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums font-bold text-red-700">
                  {formatQAR(total)}
                </td>
                {!isClosed && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile total */}
      {expenses.length > 0 && (
        <div className="md:hidden bg-amber-50/60 border-t-2 border-slate-200 px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Total Expenses
          </span>
          <span className="text-[15px] font-mono tabular-nums font-bold text-red-700">
            {formatQAR(total)}
          </span>
        </div>
      )}

      {/* Add another (mobile + desktop both) */}
      {canAdd && expenses.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 min-h-[36px] text-[13px] font-semibold text-amber-700 hover:text-amber-800 active:text-amber-900 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add another expense
          </button>
        </div>
      )}
    </div>
  );
}
