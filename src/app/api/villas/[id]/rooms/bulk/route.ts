import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const BulkUpdateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  rooms: z
    .array(
      z.object({
        roomId: z.string().min(1),
        rentAmount: z.number().min(0).max(10_000_000),
        paidAmount: z.number().min(0).max(10_000_000),
        commission: z.number().min(0).max(10_000_000).optional(),
        status: z.enum(["OCCUPIED", "EMPTY", "SOLD"]).optional(),
      })
    )
    .min(1)
    .max(500),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: villaId } = await params;

  const isAdmin = session.user.role === "ADMIN";
  const villa = await prisma.villa.findFirst({
    where: isAdmin ? { id: villaId } : { id: villaId, ownerId: session.user.id },
    include: { rooms: { select: { id: true } } },
  });
  if (!villa) return NextResponse.json({ error: "Villa not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { year, month, rooms } = parsed.data;

  // All roomIds must belong to this villa
  const validRoomIds = new Set(villa.rooms.map((r) => r.id));
  for (const r of rooms) {
    if (!validRoomIds.has(r.roomId)) {
      return NextResponse.json(
        { error: `Room ${r.roomId} does not belong to this villa` },
        { status: 400 }
      );
    }
    if (r.paidAmount > r.rentAmount && r.rentAmount > 0) {
      // Allow over-payment in case of pre-payment; just a soft warning. No error.
    }
  }

  const book = await prisma.monthlyBook.findUnique({
    where: { villaId_year_month: { villaId, year, month } },
  });
  if (book?.status === "CLOSED") {
    return NextResponse.json(
      { error: "This month is closed and cannot be edited. Reopen it first." },
      { status: 403 }
    );
  }

  await prisma.$transaction(
    rooms.map((r) => {
      const status = r.status ?? "OCCUPIED";
      // Empty / sold rooms carry no rent, payment, or commission
      const rentAmount = status === "OCCUPIED" ? r.rentAmount : 0;
      const paidAmount = status === "OCCUPIED" ? r.paidAmount : 0;
      const commission = status === "OCCUPIED" ? (r.commission ?? 0) : 0;
      return prisma.roomMonthlyRecord.upsert({
        where: { roomId_year_month: { roomId: r.roomId, year, month } },
        create: { roomId: r.roomId, year, month, rentAmount, paidAmount, commission, status },
        update: { rentAmount, paidAmount, commission, status },
      });
    })
  );

  return NextResponse.json({ ok: true, count: rooms.length });
}
