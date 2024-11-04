import { PrismaClient, TagType } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteTopicsAndQuestions() {
  console.log("Starting deletion of topics and questions...");

  try {
    // First delete all questions since they have references to tags
    await prisma.question.deleteMany({});
    console.log("Deleted all questions");

    // Then delete topic tags
    await prisma.questionTag.deleteMany({});
    console.log("Deleted all topic tags");

    console.log("Successfully deleted all topics and questions!");
  } catch (error) {
    console.error("Error during deletion:", error);
    throw error;
  }
}

// Allow running directly
if (require.main === module) {
  deleteTopicsAndQuestions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
