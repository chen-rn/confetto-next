import { PrismaClient } from "@prisma/client";
import { seedQuestions } from "./seed-questions";
import { seedStateQuestions } from "./seed-state-questions";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Add any other seeding operations here
  await seedQuestions();
  await seedStateQuestions();

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
