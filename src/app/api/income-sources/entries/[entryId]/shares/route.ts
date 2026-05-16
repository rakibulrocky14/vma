import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateShareSchema = z.object({
  shareholderId: z.string().min(1),
  sharePercent: z.number().min(0.01).max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entryId } = await params;

  // Verify entry belongs to this user
  const entry = await prisma.incomeSourceEntry.findFirst({
    where: { id: entryId, incomeSource: { createdById: session.user.id } },
    include: { shares: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateShareSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { shareholderId, sharePercent } = parsed.data;

  // Check for duplicate
  const alreadyExists = entry.shares.some((s) => s.shareholderId === shareholderId);
  if (alreadyExists) {
    return NextResponse.json({ error: "This shareholder already has a share on this entry" }, { status: 400 });
  }

  // Check total ≤ 100
  const currentTotal = entry.shares.reduce(
    (sum, s) => sum + Number(s.sharePercent),
    0
  );
  if (currentTotal + sharePercent > 100.01) {
    return NextResponse.json(
      { error: `Adding ${sharePercent}% would bring total to ${(currentTotal + sharePercent).toFixed(2)}% — must not exceed 100%.` },
      { status: 400 }
    );
  }

  const share = await prisma.incomeSourceEntryShare.create({
    data: { entryId, shareholderId, sharePercent },
    include: { shareholder: { select: { id: true, name: true } } },
  });

  return NextResponse.json(share, { status: 201 });
}
