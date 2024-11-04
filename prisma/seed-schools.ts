import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting medical schools seeding...");

  // Clear existing schools
  await prisma.school.deleteMany();
  console.log("Cleared existing schools...");

  // Read and parse CSV file
  const schoolsPath = path.join(process.cwd(), "scripts", "medical_schools.csv");
  const schoolsContent = fs.readFileSync(schoolsPath, "utf-8");

  const records = parse(schoolsContent, {
    skip_empty_lines: true,
  });

  console.log("Seeding schools...");

  let count = 0;
  for (const [country, state, name, city] of records) {
    await prisma.school.create({
      data: {
        name: name.trim(),
        state: state.trim(),
        country: country.trim(),
      },
    });
    count++;
  }

  console.log(`Successfully seeded ${count} medical schools!`);
}

main()
  .catch((e) => {
    console.error("Error seeding medical schools:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
