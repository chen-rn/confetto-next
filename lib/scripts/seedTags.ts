import { PrismaClient, type TagType } from "@prisma/client";
import { ALL_TAGS } from "../constants/tags";

const prisma = new PrismaClient();

const topicTags = [
  { name: "Ethics", type: "TOPIC" },
  { name: "Communication", type: "TOPIC" },
  { name: "Professionalism", type: "TOPIC" },
  { name: "Empathy", type: "TOPIC" },
  { name: "Critical Thinking", type: "TOPIC" },
  { name: "Decision Making", type: "TOPIC" },
  { name: "Cultural Competency", type: "TOPIC" },
  { name: "Teamwork", type: "TOPIC" },
  { name: "Leadership", type: "TOPIC" },
  { name: "Time Management", type: "TOPIC" },
  { name: "Conflict Resolution", type: "TOPIC" },
  { name: "Patient Care", type: "TOPIC" },
  { name: "Healthcare Policy", type: "TOPIC" },
  { name: "Research Ethics", type: "TOPIC" },
  { name: "Medical Ethics", type: "TOPIC" },
  { name: "Social Issues", type: "TOPIC" },
  { name: "Personal Growth", type: "TOPIC" },
];

const countryTags = [
  { name: "United States", type: "COUNTRY" },
  { name: "Canada", type: "COUNTRY" },
];

const stateTags = [
  // US States
  { name: "AL", type: "STATE" },
  { name: "AK", type: "STATE" },
  { name: "AZ", type: "STATE" },
  { name: "AR", type: "STATE" },
  { name: "CA", type: "STATE" },
  { name: "CO", type: "STATE" },
  { name: "CT", type: "STATE" },
  { name: "DE", type: "STATE" },
  { name: "FL", type: "STATE" },
  { name: "GA", type: "STATE" },
  { name: "HI", type: "STATE" },
  { name: "ID", type: "STATE" },
  { name: "IL", type: "STATE" },
  { name: "IN", type: "STATE" },
  { name: "IA", type: "STATE" },
  { name: "KS", type: "STATE" },
  { name: "KY", type: "STATE" },
  { name: "LA", type: "STATE" },
  { name: "ME", type: "STATE" },
  { name: "MD", type: "STATE" },
  { name: "MA", type: "STATE" },
  { name: "MI", type: "STATE" },
  { name: "MN", type: "STATE" },
  { name: "MS", type: "STATE" },
  { name: "MO", type: "STATE" },
  { name: "MT", type: "STATE" },
  { name: "NE", type: "STATE" },
  { name: "NV", type: "STATE" },
  { name: "NH", type: "STATE" },
  { name: "NJ", type: "STATE" },
  { name: "NM", type: "STATE" },
  { name: "NY", type: "STATE" },
  { name: "NC", type: "STATE" },
  { name: "ND", type: "STATE" },
  { name: "OH", type: "STATE" },
  { name: "OK", type: "STATE" },
  { name: "OR", type: "STATE" },
  { name: "PA", type: "STATE" },
  { name: "RI", type: "STATE" },
  { name: "SC", type: "STATE" },
  { name: "SD", type: "STATE" },
  { name: "TN", type: "STATE" },
  { name: "TX", type: "STATE" },
  { name: "UT", type: "STATE" },
  { name: "VT", type: "STATE" },
  { name: "VA", type: "STATE" },
  { name: "WA", type: "STATE" },
  { name: "WV", type: "STATE" },
  { name: "WI", type: "STATE" },
  { name: "WY", type: "STATE" },

  // Canadian Provinces and Territories
  { name: "AB", type: "STATE" },
  { name: "BC", type: "STATE" },
  { name: "MB", type: "STATE" },
  { name: "NB", type: "STATE" },
  { name: "NL", type: "STATE" },
  { name: "NS", type: "STATE" },
  { name: "ON", type: "STATE" },
  { name: "PE", type: "STATE" },
  { name: "QC", type: "STATE" },
  { name: "SK", type: "STATE" },
  { name: "NT", type: "STATE" },
  { name: "NU", type: "STATE" },
  { name: "YT", type: "STATE" },
];

async function main() {
  console.log("Start seeding...");

  // Clear existing tags first
  await prisma.questionTag.deleteMany();

  // Seed all tags
  const allTags = [...topicTags, ...countryTags, ...stateTags];

  for (const tag of allTags) {
    const questionTag = await prisma.questionTag.create({
      data: {
        name: tag.name,
        type: tag.type as TagType,
      },
    });
    console.log(`Created tag with id: ${questionTag.id}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export async function seedTags(prisma: PrismaClient) {
  console.log("Seeding tags...");

  for (const tag of ALL_TAGS) {
    await prisma.questionTag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        type: tag.type,
      },
    });
  }

  console.log("Tags seeded!");
}
