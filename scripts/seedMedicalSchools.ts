import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import path from "node:path";

interface MedicalSchool {
  country: string;
  state: string;
  name: string;
  city: string;
}

async function seedMedicalSchools() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), "./lib/scripts/medical_schools.csv");
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV content
    const records = parse(fileContent, {
      columns: false, // Since we don't have headers
      skip_empty_lines: true,
    }) as string[][];

    // Transform records into MedicalSchool objects
    const schools: MedicalSchool[] = records.map((record) => ({
      country: record[0],
      state: record[1],
      name: record[2],
      city: record[3],
    }));

    console.log(`Found ${schools.length} schools to process...`);

    // Insert schools into database
    const result = await prisma.school.createMany({
      data: schools.map((school) => ({
        name: school.name,
        state: school.state,
        country: school.country,
      })),
      skipDuplicates: true, // Skip if a school with the same name already exists
    });

    console.log(`Successfully inserted ${result.count} schools into the database`);
  } catch (error) {
    console.error("Error seeding medical schools:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedMedicalSchools()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  });
