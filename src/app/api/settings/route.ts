import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  companyName: z.string().min(1).max(100).optional(),
  address: z.string().max(300).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName: "Villa Management" },
    update: {},
  });

  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = UpdateSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName: parsed.data.companyName ?? "Villa Management", address: parsed.data.address },
    update: parsed.data,
  });

  return NextResponse.json(settings);
}
