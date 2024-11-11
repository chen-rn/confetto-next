"use server";

import { prisma } from "../prisma";
import { generateCriteria } from "./generateCriteria";
import { generateAnswerKey } from "./generateAnswerKey";
import { OpenAIError } from "openai";
import { generateAnalysisPoints, generateCoreFeedback } from "./generateFeedback";

async function prepareInterviewData(mockInterviewId: string) {
  console.log("🔍 Preparing interview data and checking required components...");

  const mockInterview = await prisma.mockInterview.findUniqueOrThrow({
    where: { id: mockInterviewId },
    include: {
      question: {
        include: {
          scoringCriteria: true,
          answerKey: true,
        },
      },
    },
  });

  const { question, recordingTranscription: transcript } = mockInterview;
  if (!transcript) throw new Error("No transcript found");

  // Generate missing data in parallel
  const promises = [];

  if (!question.scoringCriteria.length) {
    console.log("📋 No scoring criteria found - generating...");
    promises.push(generateCriteria(question.id));
  }

  if (!question.answerKey) {
    console.log("🔑 No answer key found - generating...");
    promises.push(generateAnswerKey(question.id));
  }

  if (promises.length) {
    await Promise.all(promises);
    console.log("✅ Successfully generated criteria and answer key");
  }

  // Refetch question with new data
  const updatedQuestion = await prisma.question.findUniqueOrThrow({
    where: { id: question.id },
    include: {
      scoringCriteria: true,
      answerKey: true,
    },
  });

  return { question: updatedQuestion, transcript };
}

export async function generateInterviewResult(mockInterviewId: string) {
  try {
    const { question, transcript } = await prepareInterviewData(mockInterviewId);

    console.log("🤖 Starting feedback generation with AI models...");
    // Generate feedback components in parallel
    const [coreFeedback, analysisPoints] = await Promise.all([
      generateCoreFeedback({
        question: question.content,
        transcript,
        criteria: question.scoringCriteria,
      }),
      generateAnalysisPoints({
        question: question.content,
        transcript,
      }),
    ]);

    console.log(`📊 Generated feedback with score: ${coreFeedback.overallScore}/100`);
    console.log(`📝 Analysis points generated: ${analysisPoints.length}`);

    // Update existing feedback or create new one
    return prisma.feedback.upsert({
      where: { mockInterviewId },
      create: {
        mockInterviewId,
        overallScore: coreFeedback.overallScore,
        overallFeedback: coreFeedback.overallFeedback,
        status: "COMPLETED",
        componentScores: {
          create: coreFeedback.componentScores.map((score) => ({
            ...score,
          })),
        },
        analysisPoints: { create: analysisPoints },
      },
      update: {
        overallScore: coreFeedback.overallScore,
        overallFeedback: coreFeedback.overallFeedback,
        status: "COMPLETED",
        componentScores: {
          deleteMany: {},
          create: coreFeedback.componentScores.map((score) => ({
            ...score,
          })),
        },
        analysisPoints: {
          deleteMany: {},
          create: analysisPoints,
        },
      },
      include: {
        componentScores: true,
        analysisPoints: true,
      },
    });
  } catch (error) {
    if (error instanceof OpenAIError) {
      console.error("❌ OpenAI API error:", error);
      throw new Error("Failed to generate interview feedback. Please try again.");
    }
    console.error("❌ Unexpected error during feedback generation:", error);
    throw error;
  }
}
