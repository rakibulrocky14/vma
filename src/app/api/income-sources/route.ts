import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateIncomeSourceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  phone: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sources = await prisma.incomeSource.findMany({
    where: { createdById: session.user.id },
    include: {
      entries: {
        include: {
          shares: { include: { shareholder: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sources);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateIncomeSourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const source = await prisma.incomeSource.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      createdById: session.user.id,
    },
    include: {
      entries: {
        include: {
          shares: { include: { shareholder: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  return NextResponse.json(source, { status: 201 });
}
