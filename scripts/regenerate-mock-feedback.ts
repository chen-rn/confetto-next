import { PrismaClient } from "@prisma/client";
import { generateCoreFeedback } from "../lib/actions/generateFeedback";
import { generateCriteria } from "../lib/actions/generateCriteria";

const prisma = new PrismaClient();

async function deleteFeedback(mockInterviewId: string) {
  console.log('Starting deletion process...');
  
  // First get the question ID from the mock interview
  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    select: { questionId: true }
  });

  if (!mockInterview) {
    throw new Error(`Mock interview ${mockInterviewId} not found`);
  }

  // Delete component scores
  const componentScores = await prisma.componentScore.deleteMany({
    where: {
      feedback: {
        mockInterviewId: mockInterviewId,
      },
    },
  });
  console.log(`Deleted ${componentScores.count} component scores`);

  // Delete analysis points
  const analysisPoints = await prisma.analysisPoint.deleteMany({
    where: {
      feedback: {
        mockInterviewId: mockInterviewId,
      },
    },
  });
  console.log(`Deleted ${analysisPoints.count} analysis points`);

  // Delete feedback
  const feedback = await prisma.feedback.deleteMany({
    where: {
      mockInterviewId: mockInterviewId,
    },
  });
  console.log(`Deleted ${feedback.count} feedback records`);

  // Delete scoring criteria for this question
  const scoringCriteria = await prisma.scoringCriteria.deleteMany({
    where: {
      questionId: mockInterview.questionId,
    },
  });
  console.log(`Deleted ${scoringCriteria.count} scoring criteria`);

  console.log(`Completed deletion for mock interview ${mockInterviewId}`);
}

async function main() {
  const mockInterviewId = process.argv[2];
  if (!mockInterviewId) {
    console.error("Please provide a mock interview ID");
    process.exit(1);
  }

  // Get mock interview with all necessary data
  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    include: {
      question: {
        include: {
          scoringCriteria: true,
        },
      },
      user: {
        include: {
          schools: true,
        },
      },
    },
  });

  if (!mockInterview) {
    console.error(`Mock interview with ID ${mockInterviewId} not found`);
    process.exit(1);
  }

  console.log(`Regenerating feedback for mock interview: "${mockInterview.recordingTranscription}"`);

  // Delete existing feedback
  await deleteFeedback(mockInterviewId);

  // Generate new criteria
  await generateCriteria(mockInterview.question.id);

  // Fetch the newly generated criteria
  const updatedQuestion = await prisma.question.findUnique({
    where: { id: mockInterview.question.id },
    include: {
      scoringCriteria: true,
    },
  });

  if (!updatedQuestion) {
    throw new Error("Failed to fetch updated question with new criteria");
  }

  // Generate new feedback with the new criteria
  try {
    const feedback = await generateCoreFeedback({
      question: mockInterview.question.content,
      transcript: mockInterview.recordingTranscription || "",
      criteria: updatedQuestion.scoringCriteria,
      schools: mockInterview.user.schools,
    });

    // Save new feedback
    await prisma.feedback.create({
      data: {
        mockInterviewId: mockInterviewId,
        status: "COMPLETED",
        overallScore: feedback.overallScore,
        overallFeedback: feedback.overallFeedback,
        componentScores: {
          createMany: {
            data: feedback.componentScores.map((score) => ({
              name: score.name,
              score: score.score,
              maxPoints: score.maxPoints,
              summary: score.summary,
            })),
          },
        },
      },
    });

    console.log("Successfully regenerated feedback");
  } catch (error) {
    console.error("Error generating feedback:", error);
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
