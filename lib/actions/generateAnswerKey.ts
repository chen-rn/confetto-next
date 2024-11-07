"use server";

import { prisma } from "../prisma";
import OpenAI from "openai";

interface InsightItem {
  title: string;
  description: string;
}

interface AnswerKeyResponse {
  modelAnswer: string;
  keyInsights: InsightItem[];
  answerStructure: InsightItem[];
  highlightedPoints: InsightItem[];
}

const openai = new OpenAI();

export async function generateAnswerKey(questionId: string) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: questionId },
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert medical school interviewer. Generate model answers and analysis for medical school interview questions.",
      },
      {
        role: "user",
        content: `Generate a comprehensive answer key for the following medical school interview question: "${question.content}".
        Include:
        - modelAnswer: detailed example response
        - keyInsights: array of 3-5 critical points (each with title and description)
        - answerStructure: array of 3-4 structural elements (each with title and description)
        - highlightedPoints: array of 4-6 specific points to emphasize (each with title and description)
        Return as JSON object.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const answerKey = JSON.parse(completion.choices[0].message.content!) as AnswerKeyResponse;

  return prisma.answerKey.create({
    data: {
      questionId,
      modelAnswer: answerKey.modelAnswer,
      keyInsights: {
        create: answerKey.keyInsights.map((insight) => ({
          title: insight.title,
          description: insight.description,
        })),
      },
      answerStructure: {
        create: answerKey.answerStructure.map((structure) => ({
          section: structure.title,
          purpose: structure.description,
        })),
      },
      highlightedPoints: {
        create: answerKey.highlightedPoints.map((point) => ({
          text: point.title,
          insight: point.description,
          explanation: point.description,
        })),
      },
    },
  });
}
