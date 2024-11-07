"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";

interface Criterion {
  name: string;
  description: string;
  maxScore: number;
}

export async function generateCriteria(questionId: string) {
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
        content: `Generate 5 specific scoring criteria for the following medical school interview question: "${question.content}"

For each criterion, provide:
1. name: A concise, descriptive title (3-5 words)
2. description: A detailed rubric that includes:
   - Specific behaviors and responses to look for
   - Clear distinctions between score levels (what makes a 1 vs 3 vs 5)
   - Examples of good and poor responses
   - Key phrases or concepts that should be present
3. maxScore: number representing maximum points possible for this criterion

Important scoring rules:
- The sum of all maxScore values must equal exactly 100
- Scores should be in increments of 5 (e.g., 15, 20, 25)

The criteria should cover different aspects like:
- Communication skills and clarity
- Content knowledge and understanding
- Critical thinking and analysis
- Ethical awareness (if applicable)
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

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content in API response");
  }

  try {
    const response = JSON.parse(content);
    if (!response.criteria || !Array.isArray(response.criteria)) {
      throw new Error("Invalid response format");
    }

    return prisma.scoringCriteria.createMany({
      data: response.criteria.map((criterion: Criterion) => ({
        questionId,
        name: criterion.name,
        description: criterion.description,
        maxPoints: criterion.maxScore,
      })),
    });
  } catch (error) {
    console.error("Failed to parse criteria:", content);
    throw error;
  }
}
