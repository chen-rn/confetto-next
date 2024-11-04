import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();

interface StateQuestion {
  id: string;
  question: string;
  stateCode: string;
  stateName: string;
}

interface StateQuestions {
  stateCode: string;
  stateName: string;
  numSchools: number;
  questions: StateQuestion[];
}

export async function seedStateQuestions() {
  console.log("Starting state questions seeding...");

  // Read the JSON file
  const questionsPath = path.join(
    process.cwd(),
    "scripts",
    "state specific mmi_questions o1mini",
    "all_questions.json"
  );
  const questionsContent = fs.readFileSync(questionsPath, "utf-8");
  const stateQuestions: StateQuestions[] = JSON.parse(questionsContent);

  // Process questions in batches
  const BATCH_SIZE = 50;
  for (const state of stateQuestions) {
    console.log(`Processing questions for ${state.stateName}...`);

    // Create batches of questions
    for (let i = 0; i < state.questions.length; i += BATCH_SIZE) {
      const batch = state.questions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);

      await Promise.all(
        batch.map((question) =>
          prisma.question.create({
            data: {
              content: question.question,
              tags: {
                connect: [
                  {
                    name: question.stateCode,
                  },
                ],
              },
            },
          })
        )
      );
    }
  }

  console.log("State questions seeding completed!");
}

// Allow running directly
if (require.main === module) {
  seedStateQuestions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
