import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CloseMonthSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: villaId } = await params;
  const isAdmin = session.user.role === "ADMIN";
  const villa = await prisma.villa.findFirst({
    where: isAdmin ? { id: villaId } : { id: villaId, ownerId: session.user.id },
  });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CloseMonthSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { year, month } = parsed.data;

  const book = await prisma.monthlyBook.upsert({
    where: { villaId_year_month: { villaId, year, month } },
    create: { villaId, year, month, status: "CLOSED", closedAt: new Date(), closedById: session.user.id },
    update: { status: "CLOSED", closedAt: new Date(), closedById: session.user.id },
  });

  return NextResponse.json(book);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: villaId } = await params;
  const isAdmin = session.user.role === "ADMIN";
  const villa = await prisma.villa.findFirst({
    where: isAdmin ? { id: villaId } : { id: villaId, ownerId: session.user.id },
  });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? "0");
  const month = parseInt(searchParams.get("month") ?? "0");

  await prisma.monthlyBook.updateMany({
    where: { villaId, year, month, status: "CLOSED" },
    data: { status: "OPEN", closedAt: null, closedById: null },
  });

  return NextResponse.json({ ok: true });
}
