import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncomeSourcePDF } from "@/components/pdf/IncomeSourcePDF";
import { NextResponse } from "next/server";
import { parseDecimal } from "@/lib/currency";
import { getLogoDataUri } from "@/lib/pdf-logo";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  const [source, settings] = await Promise.all([
    prisma.incomeSource.findFirst({
      where: { id, createdById: session.user.id },
      include: {
        entries: {
          include: {
            shares: {
              include: {
                shareholder: { select: { id: true, name: true } },
              },
            },
            records: { where: { year, month } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = {
    source: {
      id: source.id,
      name: source.name,
      phone: source.phone,
      notes: source.notes,
    },
    year,
    month,
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
        id: entry.id,
        propertyName: entry.propertyName,
        mySharePercent,
        shares: entry.shares.map((s) => {
          const sharePercent = parseDecimal(s.sharePercent);
          return {
            id: s.id,
            shareholderName: s.shareholder.name,
            sharePercent,
            effectivePercent: (mySharePercent * sharePercent) / 100,
            amount: (myCut * sharePercent) / 100,
          };
        }),
        totalDistributed,
        netMyPercent,
        profit,
        myCut,
        distributedAmount,
        myNetAmount,
      };
    }),
    settings: {
      companyName: settings?.companyName ?? "Villa Management",
      logoUrl: getLogoDataUri(settings?.logoUrl),
      address: settings?.address ?? null,
    },
  };

  const buffer = await renderToBuffer(<IncomeSourcePDF data={data} />);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const safeName = source.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  const filename = `income-source-${safeName}-${MONTHS[month - 1]}-${year}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
