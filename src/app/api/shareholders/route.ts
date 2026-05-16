import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateShareholderSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  const shareholders = await prisma.shareholder.findMany({
    where: isAdmin ? {} : { createdById: session.user.id },
    include: {
      villas: {
        include: { villa: { select: { id: true, villaNumber: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(shareholders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateShareholderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const shareholder = await prisma.shareholder.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(shareholder, { status: 201 });
}
