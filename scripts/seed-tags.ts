import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tags = [
    "Ethics",
    "Critical Thinking",
    "Communication",
    "Social Issues",
    "Professionalism",
    "Empathy",
    "Decision Making",
    "Cultural Competency",
    "Teamwork",
    "Leadership",
    "Time Management",
    "Conflict Resolution",
    "Patient Care",
    "Healthcare Policy",
    "Research Ethics",
    "Medical Ethics",
    "Personal Growth",
  ];

  console.log(`Found ${tags.length} tags to process`);

  await prisma.questionTag.createMany({
    data: tags.map((tag) => ({
      name: tag,
      type: "TOPIC",
    })),
    skipDuplicates: true,
  });

  console.log("Tags seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
