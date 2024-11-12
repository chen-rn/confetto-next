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
    maxPoints: number;
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
        maxPoints: z.number().min(1),
        summary: z.string().min(1),
      })
    )
    .min(1),
});

// Add validation schema for input transcript
const feedbackInputSchema = z.object({
  question: z.string().min(1),
  transcript: z.string().min(1),
  criteria: z.array(
    z.object({
      name: z.string(),
      maxPoints: z.number(),
      description: z.string(),
    })
  ),
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
  // Add logging
  console.log("Input:", { question, transcript, criteria });

  // Validate inputs
  try {
    feedbackInputSchema.parse({ question, transcript, criteria });
  } catch (error) {
    console.error("Validation error:", error);
    return {
      overallScore: 0,
      overallFeedback:
        "Invalid or empty response provided. Please provide a complete answer to receive feedback.",
      componentScores: criteria.map((c) => ({
        name: c.name,
        score: 0,
        maxPoints: c.maxPoints,
        summary: "No valid response to evaluate.",
      })),
    };
  }

  const systemPrompt = `You are an experienced medical school admissions interviewer and physician evaluating MMI responses.
  
  Important: If the response is empty, invalid, or in the wrong language, return a standardized "invalid response" JSON with 0 scores.
  
  Evaluation Process:
  1. First, evaluate each component individually
  2. Then, synthesize overall feedback based on component analysis
  3. Finally, calculate overall score as weighted average of component scores

  Response Format:
  {
    "componentScores": [
      {
        "name": string (component name),
        "score": number (earned points),
        "maxPoints": number (max points from criteria),
        "summary": string (2-3 sentences of specific feedback)
      }
    ],
    "overallFeedback": string (synthesis of key points),
    "overallScore": number (weighted average, 0-100)
  }

  For each component score:
  - Score should be between 0 and the component's total points
  - Start with specific examples from the response
  - Compare against best practices
  - Provide actionable improvements
  - Link to clinical scenarios
  - Give 0 points if response is severely inadequate (e.g. completely off-topic, single sentence, or incomprehensible)

  Scoring Guidelines (relative to total points):
  - 95-100%: Exceptional (residency-level)
  - 90-94%: Outstanding
  - 85-89%: Excellent
  - 80-84%: Very Good
  - 75-79%: Good
  - 70-74%: Satisfactory
  - 65-69%: Fair
  - 60-64%: Below Average
  - 55-59%: Poor
  - 50-54%: Very Poor
  - <50%: Unacceptable (consider 0 if critically deficient)`;

  return retryOnError(async () => {
    try {
      const completion = await openrouter.chat.completions.create({
        model: "anthropic/claude-3.5-sonnet:beta",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Evaluate this MMI response. If the response is empty or invalid, return standardized "invalid response" scores:

Question: ${question}
Transcript: ${transcript || "[Empty Response]"}

Components to evaluate (with max points):
${criteria.map((c) => `- ${c.name} (${c.maxPoints} points): ${c.description}`).join("\n")}
`,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        console.error("No content returned from AI");
        throw new Error("No content returned from AI");
      }

      console.log("AI Response:", content);

      try {
        const result = JSON.parse(content.trim());
        return coreFeedbackSchema.parse(result);
      } catch (error) {
        console.error("Parsing error:", error, "Raw content:", content);
        throw error;
      }
    } catch (error) {
      console.error("OpenRouter error:", error);
      throw error;
    }
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
