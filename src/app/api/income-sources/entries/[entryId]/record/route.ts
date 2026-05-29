import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const ProfitSchema = z.object({
  year: z.number().int().min(2000).max(3000),
  month: z.number().int().min(1).max(12),
  profit: z.number().min(0),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;

  // Verify this entry belongs to a source owned by the user
  const entry = await prisma.incomeSourceEntry.findFirst({
    where: {
      id: entryId,
      incomeSource: { createdById: session.user.id },
    },
    select: { id: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = ProfitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const record = await prisma.incomeSourceEntryRecord.upsert({
    where: { entryId_year_month: { entryId, year: parsed.data.year, month: parsed.data.month } },
    create: {
      entryId,
      year: parsed.data.year,
      month: parsed.data.month,
      profit: parsed.data.profit,
    },
    update: { profit: parsed.data.profit },
  });

  return NextResponse.json(record);
}
