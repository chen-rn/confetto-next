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
    .min(4)
    .max(5)
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
Your role is to create detailed, objective scoring rubrics that any interviewer can use consistently.`,
        },
        {
          role: "user",
          content: `Generate 4-5 scoring criteria for the following medical school interview question: "${question.content}"

For each criterion, provide:
1. name: A concise, descriptive title (3-5 words)
2. description: A detailed rubric that includes:
   - Specific behaviors and responses to look for
   - Clear distinctions between score levels
   - Examples of good and poor responses
   - Key phrases or concepts that should be present
3. maxScore: number representing maximum points possible for this criterion

Important scoring rules:
- The sum of all maxScore values must equal exactly 100
- Each criterion should be weighted based on importance (e.g. 40 points for primary skills, 20 for secondary)
- No criterion should be worth less than 10 points

The criteria should cover different aspects like:
- Communication and interpersonal skills
- Ethical reasoning and professionalism  
- Critical thinking and analysis
- Teamwork and collaboration
- Personal insight and reflection

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
