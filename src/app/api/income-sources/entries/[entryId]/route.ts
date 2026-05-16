import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateEntrySchema = z.object({
  propertyName: z.string().min(1).max(200).trim().optional(),
  mySharePercent: z.number().min(0.01).max(100).optional(),
});

async function getEntryForUser(entryId: string, userId: string) {
  return prisma.incomeSourceEntry.findFirst({
    where: {
      id: entryId,
      incomeSource: { createdById: userId },
    },
    include: { shares: true },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await getEntryForUser(entryId, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateEntrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.incomeSourceEntry.update({
    where: { id: entryId },
    data: parsed.data,
    include: {
      shares: { include: { shareholder: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;
  const existing = await getEntryForUser(entryId, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.incomeSourceEntry.delete({ where: { id: entryId } });
  return NextResponse.json({ ok: true });
}
