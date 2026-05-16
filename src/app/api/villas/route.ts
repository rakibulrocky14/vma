import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sortRooms } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateVillaSchema = z.object({
  villaNumber: z.string().min(1).max(50).trim(),
  address: z.string().min(1).max(300).trim(),
  totalRooms: z.number().int().min(1).max(200),
  shareholders: z
    .array(
      z.object({
        shareholderId: z.string().min(1),
        percentage: z.number().min(0.01).max(100),
      })
    )
    .min(1)
    .max(50),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const isAdmin = session.user.role === "ADMIN";
  const villas = await prisma.villa.findMany({
    where: isAdmin ? {} : { ownerId: session.user.id },
    include: {
      rooms: { include: { records: { where: { year, month } } } },
      shareholders: { include: { shareholder: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    villas.map((v) => ({ ...v, rooms: sortRooms(v.rooms) }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateVillaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { villaNumber, address, totalRooms, shareholders } = parsed.data;

  // Validate sum to 100%
  const totalPct = shareholders.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(totalPct - 100) > 0.01) {
    return NextResponse.json(
      { error: `Shareholder percentages must total 100%. Currently ${totalPct.toFixed(2)}%.` },
      { status: 400 }
    );
  }

  // No duplicates
  const uniqueIds = new Set(shareholders.map((s) => s.shareholderId));
  if (uniqueIds.size !== shareholders.length) {
    return NextResponse.json(
      { error: "A shareholder appears more than once" },
      { status: 400 }
    );
  }

  // All shareholderIds must exist
  const existing = await prisma.shareholder.findMany({
    where: { id: { in: shareholders.map((s) => s.shareholderId) } },
    select: { id: true },
  });
  if (existing.length !== shareholders.length) {
    return NextResponse.json(
      { error: "One or more shareholders do not exist" },
      { status: 400 }
    );
  }

  const villa = await prisma.villa.create({
    data: {
      villaNumber,
      address,
      totalRooms,
      ownerId: session.user.id,
      rooms: {
        create: Array.from({ length: totalRooms }, (_, i) => ({ roomNumber: `R${i + 1}` })),
      },
      shareholders: {
        create: shareholders.map((s) => ({
          shareholderId: s.shareholderId,
          percentage: s.percentage,
        })),
      },
    },
    include: { rooms: true, shareholders: { include: { shareholder: true } } },
  });

  return NextResponse.json(villa, { status: 201 });
}
