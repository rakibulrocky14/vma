import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sortRooms } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

function villaWhere(id: string, userId: string, role: string) {
  return role === "ADMIN" ? { id } : { id, ownerId: userId };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  const villa = await prisma.villa.findFirst({
    where: villaWhere(id, session.user.id, session.user.role as string),
    include: {
      rooms: { include: { records: { where: { year, month } } } },
      shareholders: { include: { shareholder: true } },
      expenses: { where: { year, month }, orderBy: { createdAt: "asc" } },
      monthlyBooks: { where: { year, month } },
    },
  });

  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...villa, rooms: sortRooms(villa.rooms) });
}

const UpdateVillaSchema = z.object({
  villaNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const villa = await prisma.villa.findFirst({ where: villaWhere(id, session.user.id, session.user.role as string) });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateVillaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.villa.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const villa = await prisma.villa.findFirst({ where: villaWhere(id, session.user.id, session.user.role as string) });
  if (!villa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.villa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
