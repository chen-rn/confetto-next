import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed general questions...");

  // Read the questions file
  const questionsText = fs.readFileSync(
    path.join(process.cwd(), "lib", "scripts", "generalQuestions.txt"),
    "utf-8"
  );

  // Split into individual questions and process each one
  const questionEntries = questionsText
    .split("\n\n")
    .filter((q) => q.trim())
    .map((q) => {
      // Extract topic from square brackets
      const topicMatch = q.match(/\[(.*?)\]/);
      const topic = topicMatch ? topicMatch[1].trim() : null;

      // Remove the topic from the question text
      const content = q.replace(/\[.*?\]/, "").trim();

      return { content, topic };
    });

  // Create questions with their associated tags
  for (const entry of questionEntries) {
    try {
      // Find or create the topic tag
      const topicTag = entry.topic
        ? await prisma.questionTag.upsert({
            where: { name: entry.topic },
            update: {},
            create: {
              name: entry.topic,
              type: "TOPIC",
            },
          })
        : null;

      // Create the question
      const question = await prisma.question.create({
        data: {
          content: entry.content,
          tags: topicTag
            ? {
                connect: [{ id: topicTag.id }],
              }
            : undefined,
        },
      });

      console.log(`Created question with ID: ${question.id}`);
    } catch (error) {
      console.error(`Error processing question: ${entry.content.substring(0, 50)}...`);
      console.error(error);
    }
  }

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
