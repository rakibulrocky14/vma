import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateIncomeSourceSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  const source = await prisma.incomeSource.findFirst({
    where: { id, createdById: session.user.id },
    include: {
      entries: {
        include: {
          shares: { include: { shareholder: { select: { id: true, name: true } } } },
          records: { where: { year, month } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...source, year, month });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.incomeSource.findFirst({
    where: { id, createdById: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateIncomeSourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.incomeSource.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone !== undefined ? (parsed.data.phone || null) : undefined,
      notes: parsed.data.notes !== undefined ? (parsed.data.notes || null) : undefined,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.incomeSource.findFirst({
    where: { id, createdById: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.incomeSource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
