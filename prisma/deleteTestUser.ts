import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_EMAIL = "startingthings@gmail.com";

async function deleteTestUserData() {
  try {
    // First find the user
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
      include: {
        mockInterviews: {
          include: {
            feedback: {
              include: {
                componentScores: true,
                analysisPoints: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log("Test user not found");
      return;
    }

    // Delete all related data in the correct order
    for (const mockInterview of user.mockInterviews) {
      if (mockInterview.feedback) {
        // Delete ComponentScores
        await prisma.componentScore.deleteMany({
          where: { feedbackId: mockInterview.feedback.id },
        });

        // Delete AnalysisPoints
        await prisma.analysisPoint.deleteMany({
          where: { feedbackId: mockInterview.feedback.id },
        });

        // Delete Feedback
        await prisma.feedback.delete({
          where: { id: mockInterview.feedback.id },
        });
      }

      // Delete MockInterview
      await prisma.mockInterview.delete({
        where: { id: mockInterview.id },
      });
    }

    // Disconnect schools for the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        schools: {
          set: [], // Clear all relationships
        },
      },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log("Successfully deleted test user and all associated data");
  } catch (error) {
    console.error("Error deleting test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestUserData();
