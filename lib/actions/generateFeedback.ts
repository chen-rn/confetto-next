"use server";

import type { ScoringCriteria, ComponentScore, AnalysisPoint, AnswerKey } from "@prisma/client";
import { openai } from "../openai";

interface CoreFeedbackInput {
  question: string;
  transcript: string;
  criteria: ScoringCriteria[];
}

interface CoreFeedbackResult {
  overallScore: number;
  overallFeedback: string;
  componentScores: ComponentScore[];
}

export async function generateCoreFeedback({
  question,
  transcript,
  criteria,
}: CoreFeedbackInput): Promise<CoreFeedbackResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert medical school interviewer providing feedback. 
        Score each component on a scale of 0-100. 
        The overall score should be the average of component scores.
        Return your response as JSON matching this exact structure:
        {
          "overallScore": number,
          "overallFeedback": string,
          "componentScores": [
            {
              "name": string,
              "score": number,
              "totalPoints": 100,
              "summary": string
            }
          ]
        }`,
      },
      {
        role: "user",
        content: `Analyze this interview response and provide detailed scoring:
          Question: ${question}
          Transcript: ${transcript}
          
          Score these specific components:
          ${criteria.map((c) => `- ${c.name}: ${c.description}`).join("\n")}
          
          Ensure each component gets a score between 0-100 and specific feedback.`,
      },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content returned from OpenAI");

  const result = JSON.parse(content) as CoreFeedbackResult;

  // Validate response format
  if (!result.componentScores?.length) {
    throw new Error("Invalid response: missing component scores");
  }
  if (typeof result.overallScore !== "number" || result.overallScore < 0) {
    throw new Error("Invalid response: invalid overall score");
  }

  return result;
}

export async function generateAnalysisPoints({
  question,
  transcript,
}: {
  question: string;
  transcript: string;
}): Promise<AnalysisPoint[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert medical school interviewer. Analyze the response and return your analysis as JSON array with type, quote, and analysis fields.",
      },
      {
        role: "user",
        content: `Analyze this interview response and provide analysis points as a JSON object with a 'points' array. Each point should have:
          - type: "STRENGTH" | "IMPROVEMENT" | "MISSING"
          - quote: relevant quote from transcript (or null if general point)
          - analysis: detailed analysis of the point
          
          Return format:
          {
            "points": [
              {
                "type": "STRENGTH" | "IMPROVEMENT" | "MISSING",
                "quote": string | null,
                "analysis": string
              }
            ]
          }
          
          Question: ${question}
          Transcript: ${transcript}`,
      },
    ],
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content returned from OpenAI");

  const result = JSON.parse(content);
  if (!result.points) throw new Error("Invalid response format: missing points array");

  return result.points.map((point: AnalysisPoint) => ({
    ...point,
    type: point.type || "STRENGTH",
  }));
}

export async function generateAnswerKey({
  question,
}: {
  question: string;
}): Promise<Omit<AnswerKey, "id" | "questionId">> {
  const prompt = `As an expert medical school interviewer, create a comprehensive answer key as JSON for this MMI question:
Question: ${question}

Return a JSON response matching this exact structure:
{
  "modelAnswer": "string", // Detailed model answer text
  "keyInsights": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "answerStructure": [
    {
      "section": "string", 
      "purpose": "string"
    }
  ],
  "highlightedPoints": [
    {
      "text": "string",
      "insight": "string", 
      "explanation": "string"
    }
  ]
}

Make it detailed and specific to medical ethics and professional judgment.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert medical school interviewer. Return your response as JSON matching the exact schema provided.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content returned from OpenAI");

  const result = JSON.parse(content);

  // Validate response matches schema
  if (
    !result.modelAnswer ||
    !Array.isArray(result.keyInsights) ||
    !Array.isArray(result.answerStructure) ||
    !Array.isArray(result.highlightedPoints)
  ) {
    throw new Error("Invalid response format from OpenAI");
  }

  return result;
}
