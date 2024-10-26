import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing schools
  await prisma.school.deleteMany({});

  // Create test schools
  await prisma.school.createMany({
    data: [
      {
        name: "University of Toronto",
        state: "Ontario",
        country: "Canada",
      },
      {
        name: "McMaster University",
        state: "Ontario",
        country: "Canada",
      },
      {
        name: "Harvard Medical School",
        state: "Massachusetts",
        country: "United States",
      },
      {
        name: "Stanford School of Medicine",
        state: "California",
        country: "United States",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
