"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";
import type { ScoringCriteria } from "@prisma/client";
import { z } from "zod";
import { validateAIResponse } from "../utils/ai-validation";

interface ModelAnswerResponse {
  modelAnswer: string;
}

interface KeyInsight {
  title: string;
  description: string;
}

interface KeyInsightsResponse {
  insights: KeyInsight[];
}

interface StructureItem {
  title: string;
  description: string;
}

interface StructureResponse {
  structure: StructureItem[];
}

interface HighlightedPoint {
  text: string;
  insight: string;
  explanation: string;
}

interface HighlightedPointsResponse {
  points: HighlightedPoint[];
}

// Define schemas
const modelAnswerSchema = z.object({
  modelAnswer: z.string().min(1),
});

const keyInsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1)
    .max(5),
});

const answerStructureSchema = z.object({
  structure: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(3)
    .max(6),
});

const highlightedPointsSchema = z.object({
  points: z
    .array(
      z.object({
        text: z.string().min(1),
        insight: z.string().min(1),
        explanation: z.string().min(1),
      })
    )
    .min(2)
    .max(4),
});

async function generateModelAnswer(content: string) {
  try {
    const systemPrompt = `You are an expert medical school interviewer. Create a strong MMI answer that demonstrates clear thinking and ethical awareness.

Requirements:
- Natural, conversational tone
- 3-4 minutes when spoken (~300 words)
- Show structured thinking
- Use paragraph breaks with \n\n`;

    const userPrompt = `Create a realistic MMI answer for: "${content}"

Return a JSON object in this exact format:
{
  "modelAnswer": "Your answer here in a single line with escaped quotes"
}`;

    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    return validateAIResponse({
      schema: modelAnswerSchema,
      content: completion.choices[0]?.message?.content,
      fallback: { modelAnswer: "Failed to generate model answer" },
    });
  } catch (error) {
    console.error("Error in generateModelAnswer:", error);
    throw new Error("Failed to generate model answer");
  }
}

async function generateKeyInsights(answerKeyId: string, modelAnswer: string) {
  try {
    const systemPrompt = `You are an expert medical school interview evaluator with experience training successful candidates. Extract key insights that demonstrate mastery of medical ethics and clinical reasoning.

Focus on:
- Ethical frameworks and principles applied
- Clinical reasoning patterns
- Communication strategies
- Professional considerations
- Evidence-based approaches`;

    const userPrompt = `Analyze this model answer and identify 3 key insights:

${modelAnswer}

Respond with a JSON object like this:
{
  "insights": [
    {
      "title": "Brief, actionable insight title",
      "description": "2-3 sentence practical explanation"
    }
  ]
}`;

    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const validatedResponse = await validateAIResponse({
      schema: keyInsightsSchema,
      content: completion.choices[0]?.message?.content,
      fallback: { insights: [] },
    });

    await prisma.keyInsight.createMany({
      data: validatedResponse.insights.map((insight) => ({
        answerKeyId,
        title: insight.title,
        description: insight.description,
      })),
    });
  } catch (error) {
    console.error("Error generating key insights:", error);
  }
}

async function generateAnswerStructure(answerKeyId: string, modelAnswer: string) {
  try {
    const systemPrompt = `You are an MMI interview coach who has trained thousands of successful medical school candidates. Break down model answers into clear structural components.

Your response MUST:
1. Include 4-5 distinct sections
2. Each section must have a clear title with timing (e.g. "Opening (30 seconds)")
3. Each description must be a single clear sentence
4. Avoid any special formatting or characters
5. Structure should follow: Opening -> Main Arguments -> Implementation -> Conclusion`;

    const userPrompt = `Break this model answer into a realistic 4-5 minute structure:

${modelAnswer}

Return a JSON object with this exact format (no additional fields):
{
  "structure": [
    {
      "title": "string (section name with duration)",
      "description": "string (simple description without special characters)"
    }
  ]
}`;

    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const validatedResponse = await validateAIResponse({
      schema: answerStructureSchema,
      content: completion.choices[0]?.message?.content,
      fallback: { structure: [] },
    });

    const cleanedStructure = validatedResponse.structure.map((item) => ({
      title: String(item.title).trim(),
      description: String(item.description).trim(),
    }));

    await prisma.answerStructure.createMany({
      data: cleanedStructure.map((item) => ({
        answerKeyId,
        section: item.title,
        purpose: item.description,
      })),
    });

    return cleanedStructure;
  } catch (error) {
    console.error("Error generating answer structure:", error);
    throw new Error("Failed to generate answer structure");
  }
}

async function generateHighlightedPoints(answerKeyId: string, modelAnswer: string) {
  try {
    const systemPrompt = `You are a medical school admissions committee member who evaluates MMI responses. Identify crucial moments that demonstrate clinical competency and ethical reasoning.

Focus on moments that show:
- Complex ethical reasoning
- Clinical decision-making process
- Professional behavior/communication
- Evidence-based thinking
- Cultural competency
- Systems-level understanding`;

    const userPrompt = `Identify 2-3 key moments that demonstrate the main requirements of the question. Focus only on the most important points that directly address the core of what's being asked:

${modelAnswer}

Respond with a JSON object like this:
{
  "points": [
    {
      "text": "Direct quote from answer that demonstrates a core requirement",
      "insight": "Which main aspect of the question this addresses",
      "explanation": "How this demonstrates understanding of the core requirement"
    }
  ]
}`;

    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const validatedResponse = await validateAIResponse({
      schema: highlightedPointsSchema,
      content: completion.choices[0]?.message?.content,
      fallback: { points: [] },
    });

    await prisma.highlightedPoint.createMany({
      data: validatedResponse.points.map((point) => ({
        answerKeyId,
        text: point.text,
        insight: point.insight,
        explanation: point.explanation,
      })),
    });
  } catch (error) {
    console.error("Error generating highlighted points:", error);
    throw new Error("Failed to generate highlighted points");
  }
}

export async function generateAnswerKey(questionId: string) {
  try {
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: questionId },
      include: {
        scoringCriteria: true,
      },
    });

    const modelAnswerResponse = await generateModelAnswer(question.content);

    const answerKey = await prisma.answerKey.create({
      data: {
        questionId,
        modelAnswer: modelAnswerResponse.modelAnswer,
        keyInsights: { create: [] },
        answerStructure: { create: [] },
        highlightedPoints: { create: [] },
      },
    });

    // Run parallel tasks but catch errors individually
    const results = await Promise.allSettled([
      generateKeyInsights(answerKey.id, modelAnswerResponse.modelAnswer),
      generateAnswerStructure(answerKey.id, modelAnswerResponse.modelAnswer),
      generateHighlightedPoints(answerKey.id, modelAnswerResponse.modelAnswer),
    ]);

    // Log any errors from parallel tasks
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Task ${index} failed:`, result.reason);
      }
    });

    return answerKey;
  } catch (error) {
    console.error("Error in generateAnswerKey:", error);
    throw new Error("Failed to generate answer key");
  }
}
