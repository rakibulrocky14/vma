import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sortRooms } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? "0");
  const month = parseInt(searchParams.get("month") ?? "0");

  if (!year || !month) {
    // Return list of available months
    const isAdmin = session.user.role === "ADMIN";
    const books = await prisma.monthlyBook.findMany({
      where: isAdmin ? {} : { villa: { ownerId: session.user.id } },
      select: { year: true, month: true, status: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      distinct: ["year", "month"],
    });

    return NextResponse.json(books);
  }

  const isAdmin = session.user.role === "ADMIN";
  const villas = await prisma.villa.findMany({
    where: isAdmin ? {} : { ownerId: session.user.id },
    include: {
      rooms: { include: { records: { where: { year, month } } } },
      expenses: { where: { year, month } },
      shareholders: { include: { shareholder: true } },
      monthlyBooks: { where: { year, month } },
    },
  });

  return NextResponse.json(
    villas.map((v) => ({ ...v, rooms: sortRooms(v.rooms) }))
  );
}
