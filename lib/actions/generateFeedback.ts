"use server";

import type { ScoringCriteria, AnalysisPoint, School } from "@prisma/client";
import { openrouter } from "../openrouter";
import { z } from "zod";
import { determineEvaluationFrameworks, getEvaluationPrompt } from "../utils/evaluationFrameworks";

interface CoreFeedbackInput {
  question: string;
  transcript: string;
  criteria: ScoringCriteria[];
  schools: School[]; // Add schools to determine frameworks
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
  schools: z.array(z.object({})), // Add validation for schools
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
  schools,
}: CoreFeedbackInput): Promise<CoreFeedbackResult> {
  // Add logging
  console.log("Input:", { question, transcript, criteria, schools });

  // Validate inputs
  try {
    feedbackInputSchema.parse({ question, transcript, criteria, schools });
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

  const frameworks = determineEvaluationFrameworks(schools);
  const frameworkPrompt = getEvaluationPrompt(frameworks);

  const systemPrompt = `You are an expert evaluator specializing in ethical reasoning and argumentation.

  Question: "${question}"
  
  Response to Evaluate: "${transcript}"

  Important: 
  - Evaluate the quality of ethical reasoning, argumentation, and analysis
  - Focus on the depth of ethical considerations, clarity of logic, and practical implications
  - Response Length Guidelines:
    * Responses under ~200 words should not score above 70 points overall (insufficient development)
    * Responses under ~100 words should not score above 50 points overall (lacks depth)
    * Extremely brief responses under ~50 words should not score above 30 points (inadequate analysis)
  
  Evaluation Process:
  1. Assess each component individually based on the rubric
  2. Synthesize overall feedback highlighting key strengths and areas for improvement
  3. Calculate overall score considering the depth and quality of ethical analysis

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
  - Score should reflect the quality of ethical reasoning and analysis
  - Identify specific examples of strong/weak argumentation
  - Evaluate the logical structure and flow
  - Consider the application of ethical principles
  - Assess practical implications and real-world considerations
  - Give 0 points if response lacks meaningful ethical analysis

  Scoring Guidelines:
  95-100%: Exceptional
    - Sophisticated ethical analysis
    - Clear, compelling argumentation
    - Thorough consideration of implications
    
  85-94%: Strong
    - Well-developed ethical reasoning
    - Logical structure
    - Good consideration of implications
    
  75-84%: Competent
    - Clear ethical considerations
    - Generally logical flow
    - Some practical analysis
    
  65-74%: Developing
    - Basic ethical awareness
    - Some structure present
    - Limited practical consideration
    
  Below 65%: Needs Improvement
    - Minimal ethical analysis
    - Poor structure
    - Lacks practical considerations`;

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
  schools,
}: {
  question: string;
  transcript: string;
  schools: School[];
}): Promise<AnalysisPoint[]> {
  const frameworks = determineEvaluationFrameworks(schools);
  const frameworkPrompt = getEvaluationPrompt(frameworks);

  const systemPrompt = `You are an expert medical school interviewer analyzing MMI responses. ${frameworkPrompt}

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

  Each point must:
  - Reference specific transcript quotes
  - Make sure the feedback is specific and actionable
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
