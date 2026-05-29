import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateShareholderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

function shareholderWhere(id: string, userId: string, role: string) {
  return role === "ADMIN" ? { id } : { id, createdById: userId };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shareholder = await prisma.shareholder.findFirst({
    where: shareholderWhere(id, session.user.id, session.user.role as string),
    include: {
      villas: {
        include: {
          villa: {
            select: {
              id: true,
              villaNumber: true,
              address: true,
              rooms: { include: { records: true } },
              expenses: true,
            },
          },
        },
      },
      incomeSourceShares: {
        include: {
          entry: {
            include: {
              incomeSource: { select: { id: true, name: true } },
              records: true,
            },
          },
        },
      },
    },
  });

  if (!shareholder) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shareholder);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.shareholder.findFirst({
    where: shareholderWhere(id, session.user.id, session.user.role as string),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateShareholderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const shareholder = await prisma.shareholder.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
    },
  });

  return NextResponse.json(shareholder);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.shareholder.findFirst({
    where: shareholderWhere(id, session.user.id, session.user.role as string),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const inUse = await prisma.villaShareholder.count({ where: { shareholderId: id } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: "Cannot delete shareholder while they are linked to villas" },
      { status: 400 }
    );
  }

  await prisma.shareholder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
