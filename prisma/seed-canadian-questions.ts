import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();

interface CanadianQuestion {
  id: string;
  question: string;
  provinceCode: string;
  provinceName: string;
}

interface ProvinceQuestions {
  provinceCode: string;
  provinceName: string;
  numSchools: number;
  questions: CanadianQuestion[];
}

export async function seedCanadianQuestions() {
  console.log("Starting Canadian province questions seeding...");

  // Read the JSON file
  const questionsPath = path.join(
    process.cwd(),
    "scripts",
    "state specific mmi_questions o1mini",
    "all_canadian_questions.json"
  );
  const questionsContent = fs.readFileSync(questionsPath, "utf-8");
  const provinceQuestions: ProvinceQuestions[] = JSON.parse(questionsContent);

  // Process questions in batches
  const BATCH_SIZE = 50;
  for (const province of provinceQuestions) {
    console.log(`Processing questions for ${province.provinceName}...`);

    // Create batches of questions
    for (let i = 0; i < province.questions.length; i += BATCH_SIZE) {
      const batch = province.questions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);

      await Promise.all(
        batch.map((question) =>
          prisma.question.create({
            data: {
              content: question.question,
              tags: {
                connect: [
                  {
                    name: question.provinceCode,
                  },
                ],
              },
            },
          })
        )
      );
    }
  }

  console.log("Canadian province questions seeding completed!");
}

// Allow running directly
if (require.main === module) {
  seedCanadianQuestions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
