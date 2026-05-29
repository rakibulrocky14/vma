import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { HoldingsPDF } from "@/components/pdf/HoldingsPDF";
import { NextResponse } from "next/server";
import { computeProfit } from "@/lib/calculations";
import { parseDecimal } from "@/lib/currency";
import { getLogoDataUri } from "@/lib/pdf-logo";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  const [user, villas, myShareholderRecord, sources, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
    prisma.villa.findMany({
      where: { ownerId: session.user.id },
      include: {
        rooms: { include: { records: { where: { year, month } } } },
        expenses: { where: { year, month } },
        shareholders: { include: { shareholder: true } },
      },
      orderBy: { villaNumber: "asc" },
    }),
    prisma.shareholder.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    prisma.incomeSource.findMany({
      where: { createdById: session.user.id },
      include: {
        entries: {
          include: {
            shares: { include: { shareholder: { select: { id: true, name: true } } } },
            records: { where: { year, month } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const villaRows = villas.map((v) => {
    const rooms = v.rooms.map((r) => ({
      rentAmount: r.records[0]?.rentAmount ?? 0,
      paidAmount: r.records[0]?.paidAmount ?? 0,
    }));
    const expenses = v.expenses.map((e) => ({ amount: e.amount }));
    const summary = computeProfit(
      rooms,
      expenses,
      v.shareholders.map((vs) => ({
        id: vs.shareholder.id,
        name: vs.shareholder.name,
        percentage: parseDecimal(vs.percentage),
      }))
    );

    const myVSSplit = myShareholderRecord
      ? summary.shareholderSplits.find((s) => s.id === myShareholderRecord.id)
      : null;
    const ownerShare = myVSSplit ? myVSSplit.percentage : parseDecimal(v.ownerShare);
    const myAmount = myVSSplit
      ? myVSSplit.amount
      : ownerShare > 0 ? (summary.netProfit * ownerShare) / 100 : 0;

    return {
      villaId: v.id,
      villaNumber: v.villaNumber,
      address: v.address,
      ownerShare,
      totalCollected: summary.totalCollected,
      totalExpenses: summary.totalExpenses,
      netProfit: summary.netProfit,
      myAmount,
    };
  });

  const sourceRows = sources.map((source) => ({
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
      const profit = entry.records[0] ? parseDecimal(entry.records[0].profit) : 0;
      const myCut = (profit * mySharePercent) / 100;
      const distributedAmount = (myCut * totalDistributed) / 100;
      const myNetAmount = myCut - distributedAmount;
      return {
        entryId: entry.id,
        propertyName: entry.propertyName,
        mySharePercent,
        totalDistributed,
        netMyPercent,
        profit,
        myCut,
        distributedAmount,
        myNetAmount,
      };
    }),
  }));

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const data = {
    year,
    month,
    managerName: user?.name ?? "Manager",
    villas: villaRows,
    incomeSources: sourceRows,
    settings: {
      companyName: settings?.companyName ?? "Villa Management",
      logoUrl: getLogoDataUri(settings?.logoUrl),
      address: settings?.address ?? null,
    },
  };

  const buffer = await renderToBuffer(<HoldingsPDF data={data} />);
  const filename = `holdings-${MONTHS[month - 1]}-${year}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
