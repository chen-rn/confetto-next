import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";
import { ALL_TAGS } from "../lib/constants/tags";

const prisma = new PrismaClient();

export async function seedQuestions() {
  console.log("Starting question seeding...");

  // First, clear existing data
  await prisma.questionTag.deleteMany();
  await prisma.question.deleteMany();

  console.log("Cleared existing questions and tags...");

  // Seed tags
  console.log("Seeding tags...");
  const createdTags = await Promise.all(
    ALL_TAGS.map(async (tag) => {
      return await prisma.questionTag.create({
        data: {
          name: tag.name,
          type: tag.type,
        },
      });
    })
  );

  console.log(`Created ${createdTags.length} tags`);

  // Read and parse questions file
  const questionsPath = path.join(process.cwd(), "scripts", "generalQuestions.txt");
  const questionsContent = fs.readFileSync(questionsPath, "utf-8");
  const questions = questionsContent.split("\n\n").filter((q) => q.trim());

  console.log("Seeding questions...");

  for (const questionText of questions) {
    // Extract tags from square brackets at the end of the question
    const match = questionText.match(/(.*?)\[(.*?)\]/);
    if (!match) continue;

    const [, content, tagString] = match;
    const tagNames = tagString.split(",").map((t) => t.trim());

    // Create question with connected tags
    await prisma.question.create({
      data: {
        content: content.trim(),
        tags: {
          connect: tagNames.map((tagName) => ({
            name: tagName,
          })),
        },
      },
    });
  }

  console.log("Question seeding completed!");
}

// Allow running directly
if (require.main === module) {
  seedQuestions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
