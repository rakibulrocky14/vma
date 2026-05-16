import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateExpenseSchema = z.object({
  description: z.string().min(1).max(200).trim().optional(),
  amount: z.number().min(0.01).max(10_000_000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id },
    include: { villa: { select: { ownerId: true } } },
  });
  const isAdmin = session.user.role === "ADMIN";
  if (!expense || (!isAdmin && expense.villa.ownerId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const book = await prisma.monthlyBook.findUnique({
    where: { villaId_year_month: { villaId: expense.villaId, year: expense.year, month: expense.month } },
  });
  if (book?.status === "CLOSED") {
    return NextResponse.json(
      { error: "This month is closed and cannot be edited. Reopen it first." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = UpdateExpenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.expense.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const expense = await prisma.expense.findFirst({
    where: { id },
    include: { villa: { select: { ownerId: true } } },
  });
  const isAdmin = session.user.role === "ADMIN";
  if (!expense || (!isAdmin && expense.villa.ownerId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const book = await prisma.monthlyBook.findUnique({
    where: { villaId_year_month: { villaId: expense.villaId, year: expense.year, month: expense.month } },
  });
  if (book?.status === "CLOSED") {
    return NextResponse.json(
      { error: "This month is closed and cannot be edited. Reopen it first." },
      { status: 403 }
    );
  }

  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
