"use server";

import { prisma } from "../prisma";
import { generateCriteria } from "./generateCriteria";
import { generateAnswerKey } from "./generateAnswerKey";
import { OpenAIError } from "openai";
import { generateAnalysisPoints, generateCoreFeedback } from "./generateFeedback";

async function prepareInterviewData(mockInterviewId: string) {
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
    promises.push(generateCriteria(question.id));
  }

  if (!question.answerKey) {
    promises.push(generateAnswerKey(question.id));
  }

  if (promises.length) {
    await Promise.all(promises);
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

    return prisma.feedback.create({
      data: {
        mockInterviewId,
        overallScore: coreFeedback.overallScore,
        overallFeedback: coreFeedback.overallFeedback,
        componentScores: {
          create: coreFeedback.componentScores.map((score) => ({
            ...score,
          })),
        },
        analysisPoints: { create: analysisPoints },
      },
      include: {
        componentScores: true,
        analysisPoints: true,
      },
    });
  } catch (error) {
    if (error instanceof OpenAIError) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate interview feedback. Please try again.");
    }
    throw error;
  }
}
