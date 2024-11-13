import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    // Delete all ComponentScores and AnalysisPoints first (they're connected to Feedback)
    await prisma.componentScore.deleteMany({});
    await prisma.analysisPoint.deleteMany({});

    // Delete all Feedback records
    await prisma.feedback.deleteMany({});

    // Delete all MockInterviews
    await prisma.mockInterview.deleteMany({});

    // First get all users
    const users = await prisma.user.findMany();

    // Disconnect schools for each user individually
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          schools: {
            set: [], // Clear all relationships
          },
        },
      });
    }

    // Finally delete all Users
    await prisma.user.deleteMany({});

    console.log("Successfully deleted all users and their associated data");
  } catch (error) {
    console.error("Error deleting users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
