import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function createDemoInterviews(userId: string) {
  // First, delete all existing mock interviews and their dependencies for this user
  const existingInterviews = await prisma.mockInterview.findMany({
    where: { userId },
    include: {
      feedback: true,
    },
  });

  // Delete in correct order to handle foreign key constraints
  for (const interview of existingInterviews) {
    if (interview.feedback) {
      // Delete component scores and analysis points
      await prisma.componentScore.deleteMany({
        where: { feedbackId: interview.feedback.id },
      });
      await prisma.analysisPoint.deleteMany({
        where: { feedbackId: interview.feedback.id },
      });
      // Delete feedback
      await prisma.feedback.delete({
        where: { id: interview.feedback.id },
      });
    }
  }

  // Now safe to delete mock interviews
  await prisma.mockInterview.deleteMany({
    where: { userId },
  });

  // Get all available questions
  const questions = await prisma.question.findMany();

  // Create a default question if none exist
  if (questions.length === 0) {
    await prisma.question.create({
      data: {
        content: "Tell me about a time when you had to deal with a difficult patient.",
        tags: {
          create: {
            name: "Communication",
            type: "SKILL",
          },
        },
      },
    });
    questions.push(await prisma.question.findFirstOrThrow());
  }

  // Generate more realistic scores with variation but overall upward trend
  const startDate = new Date("2023-11-01T12:00:00-08:00");
  const endDate = new Date("2023-12-08T23:59:59-08:00");

  const baseScores = [
    50,
    54,
    52, // Early dip
    56,
    60,
    58,
    63,
    67,
    65, // Mid dip
    70,
    73,
    69, // Another dip
    75,
    78,
    74, // Late dip
    80,
    85,
    82,
    88,
    95, // Final push
  ];

  // Add more significant random variation to scores
  const scores = baseScores.map((score) => {
    const variation = Math.floor(Math.random() * 7) - 3; // Random variation between -3 and +3
    return Math.max(48, Math.min(95, score + variation)); // Allow slightly lower minimum for more realism
  });

  const feedbackTemplates = [
    "Needs significant improvement in structure and content.",
    "Shows basic understanding but requires more practice.",
    "Slight regression today, focus on maintaining consistency.",
    "Good improvement in response structure.",
    "Demonstrates better understanding and confidence.",
    "Minor setback, but keeping overall progress.",
    "Very good response with clear structure.",
    "Excellent improvement in overall performance.",
    "Today was challenging, but learning from mistakes.",
    "Strong recovery from previous performance.",
    "Good effort but had some difficulty with clarity.",
    "Showing resilience after recent challenges.",
    "Well-structured but anxiety affected performance.",
    "Strong comeback with improved confidence.",
    "Some nervousness today, but handled well.",
    "Very professional approach despite challenges.",
    "Impressive recovery and adaptation.",
    "Outstanding clarity after recent feedback.",
    "Exceptional performance showing great progress.",
    "Remarkable improvement from initial attempts.",
  ];

  // Generate interview dates first
  const interviews = Array.from({ length: 20 }, () => ({
    date: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
  }));

  // Sort interviews by date
  interviews.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create interviews in chronological order with matching scores
  for (let i = 0; i < 20; i++) {
    const interviewDate = interviews[i].date;

    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    await prisma.mockInterview.create({
      data: {
        id: randomUUID(),
        userId: userId,
        questionId: randomQuestion.id,
        recordingUrl: `https://storage.googleapis.com/mock-interviews/recordings/interview-${
          i + 1
        }.mp3`,
        videoUrl: `https://storage.googleapis.com/mock-interviews/videos/interview-${i + 1}.mp4`,
        createdAt: interviewDate,
        updatedAt: interviewDate,
        feedback: {
          create: {
            status: "COMPLETED",
            overallScore: scores[i],
            overallFeedback: feedbackTemplates[i % feedbackTemplates.length],
            createdAt: interviewDate,
            updatedAt: interviewDate,
          },
        },
      },
    });
  }
}

async function main() {
  try {
    // Find or create a demo user
    const demoUser = await prisma.user.findFirst({
      where: { email: "chenxi9649@gmail.com" },
    });
    if (!demoUser) {
      console.log("Demo user not found, skipping demo data population.");
      return;
    }

    await createDemoInterviews(demoUser.id);
    console.log("Successfully populated demo interviews!");
  } catch (error) {
    console.error("Error populating demo data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
