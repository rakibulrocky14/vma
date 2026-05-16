import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ShareholderReportPDF } from "@/components/pdf/ShareholderReportPDF";
import { NextResponse } from "next/server";
import { computeProfit } from "@/lib/calculations";
import { parseDecimal } from "@/lib/currency";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const isAdmin = session.user.role === "ADMIN";
  const [shareholder, settings] = await Promise.all([
    prisma.shareholder.findFirst({
      where: isAdmin ? { id } : { id, createdById: session.user.id },
      include: {
        villas: {
          include: {
            villa: {
              include: {
                rooms: { include: { records: { where: { year, month } } } },
                expenses: { where: { year, month } },
              },
            },
          },
        },
      },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!shareholder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const villaEntries = shareholder.villas.map((vs) => {
    const v = vs.villa;
    const rooms = v.rooms.map((r) => ({
      rentAmount: r.records[0]?.rentAmount ?? 0,
      paidAmount: r.records[0]?.paidAmount ?? 0,
    }));
    const expenses = v.expenses.map((e) => ({ amount: e.amount }));
    const pct = parseDecimal(vs.percentage);
    const summary = computeProfit(rooms, expenses, [
      { id: shareholder.id, name: shareholder.name, percentage: pct },
    ]);
    return {
      villaId: v.id,
      villaNumber: v.villaNumber,
      address: v.address,
      percentage: pct,
      totalCollected: summary.totalCollected,
      totalExpenses: summary.totalExpenses,
      netProfit: summary.netProfit,
      shareholderAmount: summary.shareholderSplits[0]?.amount ?? 0,
    };
  });

  const data = {
    shareholder: {
      id: shareholder.id,
      name: shareholder.name,
      phone: shareholder.phone,
      email: shareholder.email,
    },
    year,
    month,
    villaEntries,
    settings: {
      companyName: settings?.companyName ?? "Villa Management",
      logoUrl: settings?.logoUrl
        ? `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}${settings.logoUrl}`
        : null,
      address: settings?.address ?? null,
    },
  };

  const buffer = await renderToBuffer(<ShareholderReportPDF data={data} />);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const filename = `${shareholder.name.replace(/\s+/g, "-")}-${MONTHS[month - 1]}-${year}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
