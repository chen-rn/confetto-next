"use server";

import type { ScoringCriteria, ComponentScore, AnalysisPoint } from "@prisma/client";
import { openrouter } from "../openrouter";

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
  const systemPrompt = `You are an experienced medical school admissions interviewer and physician evaluating MMI responses.

Response Format:
{
  "overallScore": number (0-100),
  "overallFeedback": string,
  "componentScores": [
    {
      "name": string,
      "score": number,
      "feedback": string,
      "examples": string[],
      "improvements": string[]
    }
  ]
}

Scoring Guidelines:
- 90-100: Exceptional (residency-level)
- 80-89: Strong candidate
- 70-79: Competent, needs development
- <70: Significant concerns

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
  const systemPrompt = `You are an expert medical school interviewer analyzing MMI responses.

  Response Format:
  {
    "points": [
      {
        "title": string,
        "description": string,
        "type": "STRENGTH" | "WEAKNESS" | "NEUTRAL",
        "evidence": string[],
        "improvement": string,
        "competencyLink": string
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
  if (!result.points) throw new Error("Invalid response format: missing points array");

  return result.points.map((point: AnalysisPoint) => ({
    ...point,
    type: point.type || "STRENGTH",
  }));
}
