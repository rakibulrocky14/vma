import { computeProfit } from "@/lib/calculations";
import { formatQAR, parseDecimal } from "@/lib/currency";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  rooms: { rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; carryIn?: number }[];
  expenses: { amount: unknown }[];
  shareholders: { shareholder: { id: string; name: string }; percentage: unknown }[];
}

export function ProfitSummary({ rooms, expenses, shareholders }: Props) {
  const summary = computeProfit(
    rooms.map((r) => ({ rentAmount: r.rentAmount, paidAmount: r.paidAmount, commission: r.commission, status: r.status, carryIn: r.carryIn })),
    expenses.map((e) => ({ amount: e.amount })),
    shareholders
      .filter((vs) => vs?.shareholder)
      .map((vs) => ({
        id: vs.shareholder.id,
        name: vs.shareholder.name,
        percentage: parseDecimal(vs.percentage),
      }))
  );

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="overflow-hidden rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Hero band */}
      <div
        className={
          "relative px-5 py-5 border-b " +
          (isProfit
            ? "bg-gradient-to-br from-emerald-50 to-emerald-50/30 border-emerald-100"
            : "bg-gradient-to-br from-red-50 to-red-50/30 border-red-100")
        }
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className={
              "flex h-8 w-8 items-center justify-center rounded-lg " +
              (isProfit ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
            }
          >
            {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
          <span
            className={
              "text-[10px] uppercase tracking-[0.2em] font-bold " +
              (isProfit ? "text-emerald-800" : "text-red-800")
            }
          >
            {isProfit ? "Net Profit" : "Net Loss"}
          </span>
        </div>
        <p
          className={
            "text-[28px] font-bold tabular-nums tracking-tight " +
            (isProfit ? "text-emerald-700" : "text-red-700")
          }
        >
          {formatQAR(summary.netProfit)}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Collected − expenses (realized profit only)
        </p>
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-3">
          Breakdown
        </p>
        <div className="space-y-2.5">
          <Row label="Rent expected" value={summary.totalRent} />
          {summary.totalCommission > 0 && (
            <Row label="Commission" value={summary.totalCommission} color="text-amber-700" prefix="−" />
          )}
          <Row label="Collected" value={summary.totalCollected} color="text-emerald-700" />
          <Row
            label="Outstanding"
            value={summary.totalDue}
            color={summary.totalDue > 0 ? "text-amber-700" : "text-slate-400"}
          />
          <Row label="Expenses" value={summary.totalExpenses} color="text-red-700" prefix="−" />
          <div className="border-t-2 border-slate-900 pt-3 mt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-[11.5px] uppercase tracking-wider font-bold text-slate-700">
                Net
              </span>
              <span
                className={
                  "text-[16px] font-bold font-mono tabular-nums " +
                  (isProfit ? "text-emerald-700" : "text-red-700")
                }
              >
                {formatQAR(summary.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shareholder splits */}
      {summary.shareholderSplits.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/40">
          <div className="px-5 py-3 flex items-baseline justify-between">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">
              Distribution
            </p>
            <p className="text-[10.5px] text-slate-400">
              {summary.shareholderSplits.length}{" "}
              {summary.shareholderSplits.length === 1 ? "owner" : "owners"}
            </p>
          </div>
          <div className="bg-white divide-y divide-slate-100">
            {summary.shareholderSplits.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 truncate">{s.name}</p>
                    <p className="text-[10.5px] text-slate-500 tabular-nums">{s.percentage}% share</p>
                  </div>
                </div>
                <span
                  className={
                    "text-[13px] font-mono font-semibold tabular-nums " +
                    (s.amount >= 0 ? "text-emerald-700" : "text-red-700")
                  }
                >
                  {formatQAR(s.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  color = "text-slate-700",
  prefix = "",
}: {
  label: string;
  value: number;
  color?: string;
  prefix?: string;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[12.5px] text-slate-500">{label}</span>
      <span className={`text-[13px] font-mono tabular-nums font-semibold ${color}`}>
        {prefix}
        {formatQAR(value)}
      </span>
    </div>
  );
}
