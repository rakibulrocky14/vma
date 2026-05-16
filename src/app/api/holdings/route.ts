import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { computeProfit } from "@/lib/calculations";
import { parseDecimal } from "@/lib/currency";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  // Own villas where user is owner/manager
  const villas = await prisma.villa.findMany({
    where: { ownerId: session.user.id },
    include: {
      rooms: { include: { records: { where: { year, month } } } },
      expenses: { where: { year, month } },
      shareholders: { include: { shareholder: true } },
    },
    orderBy: { villaNumber: "asc" },
  });

  // Find the user's linked shareholder record (if any)
  const myShareholderRecord = await prisma.shareholder.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const villaHoldings = villas.map((v) => {
    const rooms = v.rooms.map((r) => ({
      rentAmount: r.records[0]?.rentAmount ?? 0,
      paidAmount: r.records[0]?.paidAmount ?? 0,
    }));
    const expenses = v.expenses.map((e) => ({ amount: e.amount }));

    const summary = computeProfit(rooms, expenses, v.shareholders.map((vs) => ({
      id: vs.shareholder.id,
      name: vs.shareholder.name,
      percentage: parseDecimal(vs.percentage),
    })));

    // Prefer the real VillaShareholder entry linked to this user
    const myVSSplit = myShareholderRecord
      ? summary.shareholderSplits.find((s) => s.id === myShareholderRecord.id)
      : null;
    const ownerShare = myVSSplit
      ? myVSSplit.percentage
      : parseDecimal(v.ownerShare);
    const myAmount = myVSSplit
      ? myVSSplit.amount
      : ownerShare > 0 ? (summary.netProfit * ownerShare) / 100 : 0;

    return {
      villaId: v.id,
      villaNumber: v.villaNumber,
      address: v.address,
      ownerShare,
      totalRooms: v.totalRooms,
      year,
      month,
      totalCollected: summary.totalCollected,
      totalExpenses: summary.totalExpenses,
      netProfit: summary.netProfit,
      myAmount,
      shareholders: summary.shareholderSplits,
    };
  });

  // Income sources this user created
  const sources = await prisma.incomeSource.findMany({
    where: { createdById: session.user.id },
    include: {
      entries: {
        include: {
          shares: { include: { shareholder: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const sourceHoldings = sources.map((source) => ({
    sourceId: source.id,
    sourceName: source.name,
    sourcePhone: source.phone,
    entries: source.entries.map((entry) => {
      const mySharePercent = parseDecimal(entry.mySharePercent);
      const totalDistributed = entry.shares.reduce(
        (sum, s) => sum + parseDecimal(s.sharePercent),
        0
      );
      const netMyPercent = mySharePercent * (1 - totalDistributed / 100);
      return {
        entryId: entry.id,
        propertyName: entry.propertyName,
        mySharePercent,
        shares: entry.shares.map((s) => ({
          shareId: s.id,
          shareholderId: s.shareholderId,
          shareholderName: s.shareholder.name,
          sharePercent: parseDecimal(s.sharePercent),
          // Their effective % of the total property
          effectivePercent: (mySharePercent * parseDecimal(s.sharePercent)) / 100,
        })),
        totalDistributed,
        netMyPercent,
      };
    }),
  }));

  return NextResponse.json({
    year,
    month,
    villas: villaHoldings,
    incomeSources: sourceHoldings,
  });
}
