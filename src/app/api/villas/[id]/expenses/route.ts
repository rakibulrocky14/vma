import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateExpenseSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  description: z.string().min(1).max(200).trim(),
  amount: z.number().min(0.01).max(10_000_000),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: villaId } = await params;
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const isAdmin = session.user.role === "ADMIN";
  const villa = await prisma.villa.findFirst({
    where: isAdmin ? { id: villaId } : { id: villaId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!villa) return NextResponse.json({ error: "Villa not found" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { villaId, year, month },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: villaId } = await params;
  const isAdmin = session.user.role === "ADMIN";
  const villa = await prisma.villa.findFirst({
    where: isAdmin ? { id: villaId } : { id: villaId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!villa) return NextResponse.json({ error: "Villa not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { year, month } = parsed.data;
  const book = await prisma.monthlyBook.findUnique({
    where: { villaId_year_month: { villaId, year, month } },
  });
  if (book?.status === "CLOSED") {
    return NextResponse.json(
      { error: "This month is closed and cannot be edited. Reopen it first." },
      { status: 403 }
    );
  }

  const expense = await prisma.expense.create({
    data: { villaId, ...parsed.data },
  });

  return NextResponse.json(expense, { status: 201 });
}
