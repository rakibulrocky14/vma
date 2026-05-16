import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcryptjs from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcryptjs.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@villa.com" },
    update: {},
    create: {
      email: "admin@villa.com",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "Villa Management Co.",
      address: "Doha, Qatar",
    },
  });

  console.log(`✓ Admin user: ${admin.email} / admin123`);
  console.log("✓ Settings created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
