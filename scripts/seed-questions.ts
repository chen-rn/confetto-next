import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();

interface ParsedQuestion {
  content: string;
  tags: string[];
}

async function parseQuestions(content: string): Promise<ParsedQuestion[]> {
  return content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      // Extract tags from square brackets at the end of the line
      const match = line.match(/(.*?)\s*\[(.*?)\]$/);
      if (!match) return null;

      const [, content, tagString] = match;
      const tags = tagString.split(",").map((tag) => tag.trim());

      return {
        content: content.trim(),
        tags,
      };
    })
    .filter((q): q is ParsedQuestion => q !== null);
}

async function main() {
  // Read questions file
  const questionsContent = fs.readFileSync(
    path.join(process.cwd(), "scripts", "generalQuestions.txt"),
    "utf-8"
  );

  const questions = await parseQuestions(questionsContent);
  console.log(`Found ${questions.length} questions to process`);

  // Get all tags upfront
  const allTags = await prisma.questionTag.findMany();
  const tagMap = new Map(allTags.map((tag) => [tag.name, tag.id]));

  // Process questions in batches
  const batchSize = 50;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);

    const createData = batch.map((question) => {
      const validTagIds = question.tags
        .map((tagName) => tagMap.get(tagName))
        .filter((id): id is string => id !== null);

      return {
        content: question.content,
        tags: {
          connect: validTagIds.map((id) => ({ id })),
        },
      };
    });

    await prisma.$transaction(createData.map((data) => prisma.question.create({ data })));

    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log("Questions seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
