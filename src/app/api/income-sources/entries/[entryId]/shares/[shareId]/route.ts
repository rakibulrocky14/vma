import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateShareSchema = z.object({
  sharePercent: z.number().min(0.01).max(100),
});

async function getShareForUser(shareId: string, userId: string) {
  return prisma.incomeSourceEntryShare.findFirst({
    where: {
      id: shareId,
      entry: { incomeSource: { createdById: userId } },
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ entryId: string; shareId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shareId, entryId } = await params;
  const existing = await getShareForUser(shareId, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateShareSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check total wouldn't exceed 100 (excluding current share)
  const otherShares = await prisma.incomeSourceEntryShare.findMany({
    where: { entryId, id: { not: shareId } },
  });
  const otherTotal = otherShares.reduce((sum, s) => sum + Number(s.sharePercent), 0);
  if (otherTotal + parsed.data.sharePercent > 100.01) {
    return NextResponse.json(
      { error: `Total would be ${(otherTotal + parsed.data.sharePercent).toFixed(2)}% — must not exceed 100%.` },
      { status: 400 }
    );
  }

  const updated = await prisma.incomeSourceEntryShare.update({
    where: { id: shareId },
    data: { sharePercent: parsed.data.sharePercent },
    include: { shareholder: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shareId } = await params;
  const existing = await getShareForUser(shareId, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.incomeSourceEntryShare.delete({ where: { id: shareId } });
  return NextResponse.json({ ok: true });
}
