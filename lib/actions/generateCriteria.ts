"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";
import { z } from "zod";
import { validateAIResponse } from "../utils/ai-validation";

const criteriaSchema = z.object({
  criteria: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        maxScore: z.number().min(10).max(100),
      })
    )
    .min(3)
    .max(3)
    .refine(
      (data) => {
        const total = data.reduce((sum, criterion) => sum + criterion.maxScore, 0);
        return total === 100;
      },
      { message: "Total score must equal 100" }
    ),
});

export async function generateCriteria(questionId: string) {
  try {
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: questionId },
    });
    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        {
          role: "system",
          content: `You are an expert medical school interviewer and evaluator with extensive experience in MMI (Multiple Mini Interview) assessments.
Your role is to create clear, consistent scoring guidelines that help evaluate candidate responses effectively.`,
        },
        {
          role: "user",
          content: `Using our standardized scoring criteria, evaluate the following medical school interview question: "${question.content}"

The three core criteria are:

1. Content & Completeness (40 points)
   - Complete coverage of key aspects
   - Depth of understanding
   - Quality of examples and reasoning
   
2. Structure & Organization (35 points)
   - Logical flow and structure
   - Clear organization of thoughts
   - Coherent progression
   
3. Professional Communication (25 points)
   - Appropriate language and tone
   - Clear and confident delivery
   - Professional demeanor

For each criterion, provide:
- Specific behaviors and responses to look for
- Clear distinctions between score levels (excellent, good, fair, poor)
- Examples of strong and weak responses

Return as a JSON array with format:
{
  "criteria": [
    {
      "name": string,
      "description": string, 
      "maxScore": number
    }
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const validatedResponse = await validateAIResponse({
      schema: criteriaSchema,
      content: completion.choices[0]?.message?.content,
      fallback: { criteria: [] },
    });

    if (validatedResponse.criteria.length === 0) {
      throw new Error("Failed to generate valid criteria");
    }

    return prisma.scoringCriteria.createMany({
      data: validatedResponse.criteria.map((criterion) => ({
        questionId,
        name: criterion.name,
        description: criterion.description,
        maxPoints: criterion.maxScore,
      })),
    });
  } catch (error) {
    console.error("Failed to generate criteria:", error);
    throw error;
  }
}
