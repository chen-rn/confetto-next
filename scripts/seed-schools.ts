import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();

interface SchoolRow {
  country: string;
  state: string;
  name: string;
  city: string;
}

async function main() {
  // Read the CSV file
  const csvContent = fs.readFileSync(
    path.join(process.cwd(), "scripts", "medical_schools.csv"),
    "utf-8"
  );

  // Parse CSV content
  const records = parse(csvContent, {
    columns: false, // CSV doesn't have headers
    skip_empty_lines: true,
  }) as string[][];

  // Transform records into SchoolRow objects
  const schools: SchoolRow[] = records.map((row) => ({
    country: row[0],
    state: row[1],
    name: row[2],
    city: row[3],
  }));

  console.log(`Found ${schools.length} schools to process`);

  // Insert schools in batches
  const batchSize = 100;
  for (let i = 0; i < schools.length; i += batchSize) {
    const batch = schools.slice(i, i + batchSize);
    await prisma.school.createMany({
      data: batch.map((school) => ({
        name: school.name,
        state: school.state,
        country: school.country,
      })),
      skipDuplicates: true,
    });
    console.log(`Processed batch ${i / batchSize + 1}`);
  }

  console.log("Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
