import { parseDecimal } from "./currency";

export interface RoomRecord {
  rentAmount: unknown;
  paidAmount: unknown;
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
  const totalRent = rooms.reduce((sum, r) => sum + parseDecimal(r.rentAmount), 0);
  const totalCollected = rooms.reduce((sum, r) => sum + parseDecimal(r.paidAmount), 0);
  const totalDue = totalRent - totalCollected;
  const totalExpenses = expenses.reduce((sum, e) => sum + parseDecimal(e.amount), 0);
  const netProfit = totalCollected - totalExpenses;

  const shareholderSplits = shareholders.map((s) => ({
    id: s.id,
    name: s.name,
    percentage: parseDecimal(s.percentage),
    amount: (netProfit * parseDecimal(s.percentage)) / 100,
  }));

  return { totalRent, totalCollected, totalDue, totalExpenses, netProfit, shareholderSplits };
}
