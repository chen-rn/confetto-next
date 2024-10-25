import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllQuestions() {
  try {
    // First delete all Feedback
    await prisma.feedback.deleteMany();

    // Then delete MockInterviews
    await prisma.mockInterview.deleteMany();

    // Finally delete Questions
    await prisma.question.deleteMany();

    console.log("All questions and related records have been deleted");
  } catch (error) {
    console.error("Error deleting questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllQuestions();
