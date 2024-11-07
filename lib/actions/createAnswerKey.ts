"use server";

import { prisma } from "../prisma";

interface AnswerKeyInput {
  modelAnswer: string;
  keyInsights: Array<{
    title: string;
    description: string;
  }>;
  answerStructure: Array<{
    section: string;
    purpose: string;
  }>;
  highlightedPoints: Array<{
    text: string;
    insight: string;
    explanation: string;
  }>;
}

export async function createAnswerKey(questionId: string, answerKey: AnswerKeyInput) {
  return prisma.answerKey.create({
    data: {
      questionId,
      modelAnswer: answerKey.modelAnswer,
      keyInsights: {
        create: answerKey.keyInsights,
      },
      answerStructure: {
        create: answerKey.answerStructure,
      },
      highlightedPoints: {
        create: answerKey.highlightedPoints,
      },
    },
  });
}
