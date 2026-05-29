import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filename = `logo.${ext}`;
  await writeFile(join(uploadDir, filename), buffer);

  const logoUrl = `/uploads/${filename}`;
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", companyName: "Villa Management", logoUrl },
    update: { logoUrl },
  });

  return NextResponse.json({ logoUrl });
}
