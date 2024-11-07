"use server";

import { prisma } from "../prisma";
import OpenAI from "openai";

interface Criterion {
  name: string;
  description: string;
  maxScore: number;
}

interface CriteriaResponse {
  criteria: Criterion[];
}

const openai = new OpenAI();

export async function generateCriteria(questionId: string) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: questionId },
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert medical school interviewer. Generate scoring criteria for evaluating medical school interview responses.",
      },
      {
        role: "user",
        content: `Generate 5 scoring criteria for the following medical school interview question: "${question.content}". 
        Each criterion should have:
        - name: short descriptive name
        - description: detailed explanation
        - maxScore: number from 1-5
        Return as JSON array.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const { criteria } = JSON.parse(completion.choices[0].message.content!) as CriteriaResponse;
  return prisma.scoringCriteria.createMany({
    data: criteria.map((criterion) => ({
      questionId,
      name: criterion.name,
      description: criterion.description,
      maxPoints: criterion.maxScore,
    })),
  });
}
