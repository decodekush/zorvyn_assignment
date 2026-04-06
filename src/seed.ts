/**
 * Database Seed Script
 *
 * Creates three demo users (one per role) so you can immediately
 * test the API without manually registering accounts.
 *
 * Run: npm run seed
 */
import "dotenv/config";
import prisma from "./utils/prisma";
import bcrypt from "bcryptjs";

interface SeedUser {
  username: string;
  password: string;
  role: string;
}

const SEED_USERS: SeedUser[] = [
  { username: "admin", password: "admin123", role: "ADMIN" },
  { username: "analyst", password: "analyst123", role: "ANALYST" },
  { username: "viewer", password: "viewer123", role: "VIEWER" },
];

async function seed() {
  console.log("Seeding database...\n");

  for (const user of SEED_USERS) {
    const exists = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (exists) {
      console.log(`  ✓ ${user.username} (${user.role}) already exists`);
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: { username: user.username, password: hashed, role: user.role },
    });

    console.log(`  + ${user.username} (${user.role}) created`);
  }

  console.log("\nSeed complete.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
