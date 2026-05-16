import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateEntrySchema = z.object({
  propertyName: z.string().min(1).max(200).trim(),
  mySharePercent: z.number().min(0.01).max(100),
  shares: z
    .array(
      z.object({
        shareholderId: z.string().min(1),
        sharePercent: z.number().min(0.01).max(100),
      })
    )
    .optional()
    .default([]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership of the income source
  const source = await prisma.incomeSource.findFirst({
    where: { id, createdById: session.user.id },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateEntrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { propertyName, mySharePercent, shares } = parsed.data;

  // Validate total sharePercent ≤ 100
  if (shares.length > 0) {
    const totalSharePct = shares.reduce((sum, s) => sum + s.sharePercent, 0);
    if (totalSharePct > 100.01) {
      return NextResponse.json(
        { error: `Shareholder distributions total ${totalSharePct.toFixed(2)}% — must not exceed 100%.` },
        { status: 400 }
      );
    }
    // Check no duplicate shareholders
    const uniqueIds = new Set(shares.map((s) => s.shareholderId));
    if (uniqueIds.size !== shares.length) {
      return NextResponse.json({ error: "A shareholder appears more than once" }, { status: 400 });
    }
  }

  const entry = await prisma.incomeSourceEntry.create({
    data: {
      incomeSourceId: id,
      propertyName,
      mySharePercent,
      shares:
        shares.length > 0
          ? {
              create: shares.map((s) => ({
                shareholderId: s.shareholderId,
                sharePercent: s.sharePercent,
              })),
            }
          : undefined,
    },
    include: {
      shares: { include: { shareholder: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
