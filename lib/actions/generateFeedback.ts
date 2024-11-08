"use server";

import type { ScoringCriteria, ComponentScore, AnalysisPoint, AnalysisType } from "@prisma/client";
import { openrouter } from "../openrouter";
import { z } from "zod";

interface CoreFeedbackInput {
  question: string;
  transcript: string;
  criteria: ScoringCriteria[];
}

interface CoreFeedbackResult {
  overallScore: number;
  overallFeedback: string;
  componentScores: {
    name: string;
    score: number;
    totalPoints: number;
    summary: string;
  }[];
}

const coreFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallFeedback: z.string().min(1),
  componentScores: z
    .array(
      z.object({
        name: z.string().min(1),
        score: z.number().min(0),
        totalPoints: z.number().min(1),
        summary: z.string().min(1),
      })
    )
    .min(1),
});

async function retryOnError<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Attempt ${i + 1} failed, retrying...`, error);
    }
  }
  throw new Error("Max retries exceeded");
}

export async function generateCoreFeedback({
  question,
  transcript,
  criteria,
}: CoreFeedbackInput): Promise<CoreFeedbackResult> {
  const systemPrompt = `You are an experienced medical school admissions interviewer and physician evaluating MMI responses.

Response Format:
{
  "overallScore": number (0-100),
  "overallFeedback": string,
  "componentScores": [
    {
      "name": string,
      "score": number,
      "totalPoints": number,
      "summary": string
    }
  ]
}

Scoring Guidelines:
- 90-100: Exceptional (residency-level) - rare
- 75-89: Strong candidate with minor improvements needed
- 60-74: Competent but requires significant development
- 50-59: Multiple areas of concern, needs major improvement
- <50: Unacceptable performance, fundamental issues present

Evaluation Framework:
1. Clinical Reasoning & Ethics
2. Professional Identity
3. Cultural Competency
4. Leadership & Collaboration
5. Ambiguity Management

For each component:
- Cite specific examples
- Link to clinical scenarios
- Provide actionable improvements
- Assess both content and metacognition`;

  return retryOnError(async () => {
    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Conduct a thorough evaluation of this MMI response:
          
          Question: ${question}
          Transcript: ${transcript}
          
          Evaluate these specific components:
          ${criteria.map((c) => `- ${c.name}: ${c.description}`).join("\n")}
          
          For each component:
          1. Identify specific examples from the response
          2. Compare against best practices in medical interviews
          3. Suggest concrete improvements using medical scenarios
          4. Consider both verbal and metacognitive skills`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content returned from OpenAI");

    const result = JSON.parse(content.trim());
    return coreFeedbackSchema.parse(result);
  });
}

export async function generateAnalysisPoints({
  question,
  transcript,
}: {
  question: string;
  transcript: string;
}): Promise<AnalysisPoint[]> {
  const systemPrompt = `You are an expert medical school interviewer analyzing MMI responses.

  Response Format:
  {
    "points": [
      {
        "type": "STRENGTH" | "IMPROVEMENT" | "MISSING",
        "quote": string | null,
        "analysis": string
      }
    ]
  }

  Analysis Framework:
  1. Clinical Reasoning
     - Logic structure
     - Evidence usage
     - Problem-solving approach

  2. Ethics & Professionalism
     - Principle application
     - Moral reasoning
     - Self-awareness

  3. Communication
     - Clarity
     - Empathy
     - Cultural sensitivity

  Each point must:
  - Reference specific transcript quotes
  - Link to CanMEDS competencies
  - Connect to clinical practice
  - Provide concrete improvement steps`;

  return retryOnError(async () => {
    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Perform a detailed analysis of this MMI response:
          
          Question: ${question}
          Transcript: ${transcript}
          
          For each point identified:
          1. Ground observations in specific examples
          2. Connect to medical practice implications
          3. Suggest improvements using real clinical scenarios
          4. Consider both immediate and long-term development areas`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content returned from OpenAI");

    const result = JSON.parse(content);
    return result.points.map((point: AnalysisPoint) => ({
      type: point.type,
      quote: point.quote,
      analysis: point.analysis,
    }));
  });
}
