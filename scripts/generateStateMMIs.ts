import { prisma } from "../apis/prisma";
import allQuestions from "./state specific mmi_questions o1mini/all_questions.json";
import allCanadianQuestions from "./state specific mmi_questions o1mini/all_canadian_questions.json";
import { getTagByName } from "../constants/tags";

// Helper function to process questions in batches
async function processBatch(questions: any[], batchSize: number) {
  const results = [];
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (questionData) => {
        const existingQuestion = await prisma.question.findFirst({
          where: { content: questionData.content },
        });

        if (!existingQuestion) {
          return prisma.question.create({
            data: questionData,
          });
        }
      })
    );
    results.push(...batchResults);
    console.log(
      `Processed batch ${i / batchSize + 1} of ${Math.ceil(questions.length / batchSize)}`
    );
  }
  return results;
}

async function seedStateQuestions() {
  try {
    console.log("Starting to seed state-specific MMI questions...");

    // Prepare US state questions for batch creation
    const usQuestions = allQuestions.flatMap((stateData) =>
      stateData.questions.map((q) => ({
        content: q.question,
        tags: { connect: { name: stateData.stateCode } },
      }))
    );

    // Prepare Canadian province questions for batch creation
    const canadianQuestions = allCanadianQuestions.flatMap((provinceData) =>
      provinceData.questions.map((q) => ({
        content: q.question,
        tags: { connect: { name: provinceData.provinceCode } },
      }))
    );

    // Combine all questions
    const allQuestionsToCreate = [...usQuestions, ...canadianQuestions];

    // Process questions in batches of 10
    console.log(`Creating ${allQuestionsToCreate.length} questions in batches...`);
    await processBatch(allQuestionsToCreate, 10);

    console.log("Successfully seeded state-specific MMI questions!");
  } catch (error) {
    console.error("Error seeding state-specific MMI questions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedStateQuestions()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  });
