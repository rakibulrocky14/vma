import { parseDecimal } from "./currency";

export interface RoomRecord {
  rentAmount: unknown;
  paidAmount: unknown;
  commission?: unknown;
  status?: "OCCUPIED" | "EMPTY" | "SOLD" | null;
  carryIn?: number; // unpaid balance carried from previous months
}

/**
 * Cumulative unpaid balance per room from a set of PRIOR-month records.
 * carryIn(month) = Σ over all earlier months of (rent − paid − commission).
 * Commission counts as settled (it came out of the rent), so it clears the balance.
 * Empty/sold months store 0 so they naturally contribute nothing.
 */
export function sumCarryIns(
  priorRecords: { roomId: string; rentAmount: unknown; paidAmount: unknown; commission?: unknown }[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of priorRecords) {
    const balance = parseDecimal(r.rentAmount) - parseDecimal(r.paidAmount) - parseDecimal(r.commission);
    map[r.roomId] = (map[r.roomId] ?? 0) + balance;
  }
  return map;
}

export interface ShareholderSplit {
  id: string;
  name: string;
  percentage: number;
  amount: number;
}

export interface VillaProfitSummary {
  totalRent: number;
  totalCollected: number;
  totalCommission: number;
  totalDue: number;
  totalExpenses: number;
  netProfit: number;
  shareholderSplits: ShareholderSplit[];
}

export function computeProfit(
  rooms: RoomRecord[],
  expenses: { amount: unknown }[],
  shareholders: { id: string; name: string; percentage: unknown }[]
): VillaProfitSummary {
  // Empty / sold rooms never contribute rent or collection
  const active = rooms.filter((r) => !r.status || r.status === "OCCUPIED");
  // Expected rent includes this month's rent + any unpaid balance carried forward
  const totalRent = active.reduce(
    (sum, r) => sum + parseDecimal(r.rentAmount) + (r.carryIn ?? 0),
    0
  );
  const totalCollected = active.reduce((sum, r) => sum + parseDecimal(r.paidAmount), 0);
  const totalCommission = active.reduce((sum, r) => sum + parseDecimal(r.commission), 0);
  // Due = expected − collected − commission (commission came out of the rent)
  const totalDue = totalRent - totalCollected - totalCommission;
  const totalExpenses = expenses.reduce((sum, e) => sum + parseDecimal(e.amount), 0);
  // Collected is already net of commission, so profit = collected − expenses
  const netProfit = totalCollected - totalExpenses;

  const shareholderSplits = shareholders.map((s) => ({
    id: s.id,
    name: s.name,
    percentage: parseDecimal(s.percentage),
    amount: (netProfit * parseDecimal(s.percentage)) / 100,
  }));

  return { totalRent, totalCollected, totalCommission, totalDue, totalExpenses, netProfit, shareholderSplits };
}
