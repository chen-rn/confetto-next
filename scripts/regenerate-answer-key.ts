import { PrismaClient } from "@prisma/client";
import { generateAnswerKey } from "../lib/actions/generateAnswerKey";

const prisma = new PrismaClient();

async function deleteAnswerKey(questionId: string) {
  // Delete all related components first
  await prisma.keyInsight.deleteMany({
    where: {
      answerKey: {
        questionId: questionId,
      },
    },
  });

  await prisma.answerStructure.deleteMany({
    where: {
      answerKey: {
        questionId: questionId,
      },
    },
  });

  await prisma.highlightedPoint.deleteMany({
    where: {
      answerKey: {
        questionId: questionId,
      },
    },
  });

  // Then delete the answer key itself
  await prisma.answerKey.deleteMany({
    where: {
      questionId: questionId,
    },
  });

  console.log(`Deleted answer key for question ${questionId}`);
}

async function main() {
  const questionId = process.argv[2];
  if (!questionId) {
    console.error("Please provide a question ID");
    process.exit(1);
  }

  // Check if question exists
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    console.error(`Question with ID ${questionId} not found`);
    process.exit(1);
  }

  console.log(`Regenerating answer key for question: "${question.content}"`);

  // Delete existing answer key and components
  await deleteAnswerKey(questionId);

  // Generate new answer key
  try {
    await generateAnswerKey(questionId);
    console.log("Successfully regenerated answer key");
  } catch (error) {
    console.error("Error generating answer key:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
