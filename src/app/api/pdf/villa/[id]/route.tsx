import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sortRooms } from "@/lib/utils";
import { renderToBuffer } from "@react-pdf/renderer";
import { VillaReportPDF } from "@/components/pdf/VillaReportPDF";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const [villa, settings] = await Promise.all([
    prisma.villa.findFirst({
      where: { id, ownerId: session.user.id },
      include: {
        rooms: { include: { records: { where: { year, month } } } },
        expenses: { where: { year, month } },
        shareholders: { include: { shareholder: true } },
      },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sortedRooms = sortRooms(villa.rooms);

  const data = {
    villaNumber: villa.villaNumber,
    address: villa.address,
    year,
    month,
    rooms: sortedRooms.map((r) => ({
      id: r.id,
      roomNumber: r.roomNumber,
      rentAmount: r.records[0]?.rentAmount ?? 0,
      paidAmount: r.records[0]?.paidAmount ?? 0,
    })),
    expenses: villa.expenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
    })),
    shareholders: villa.shareholders.map((vs) => ({
      shareholder: { id: vs.shareholder.id, name: vs.shareholder.name },
      percentage: vs.percentage,
    })),
    settings: {
      companyName: settings?.companyName ?? "Villa Management",
      logoUrl: settings?.logoUrl
        ? `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}${settings.logoUrl}`
        : null,
      address: settings?.address ?? null,
    },
  };

  const buffer = await renderToBuffer(<VillaReportPDF data={data} />);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const filename = `${villa.villaNumber}-${MONTHS[month - 1]}-${year}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
