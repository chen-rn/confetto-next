"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";
import type { ScoringCriteria } from "@prisma/client";

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

async function generateModelAnswer(content: string) {
  try {
    const systemPrompt = `You are an expert medical school interviewer. Think through what makes an excellent MMI response:

1. Demonstrate clear ethical reasoning and clinical judgment
2. Show empathy and strong communication skills
3. Support arguments with specific examples
4. Present practical, actionable solutions
5. Maintain professionalism throughout

Your response should be around 500 words long with a clear structure.`;

    const userPrompt = `Create a model answer for this MMI question: "${content}"

Return a JSON object in this exact format:
{
  "modelAnswer": "Your answer here in a single line with escaped quotes"
}`;

    const completion = await openrouter.chat.completions.create({
      model: "openai/o1-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    const response = JSON.parse(responseContent) as ModelAnswerResponse;
    if (!response.modelAnswer) {
      throw new Error("Response missing modelAnswer field");
    }

    return response.modelAnswer;
  } catch (error) {
    console.error("Error in generateModelAnswer:", error);
    throw error;
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

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    let response: KeyInsightsResponse;
    try {
      response = JSON.parse(responseContent);
      if (
        !response.insights ||
        !Array.isArray(response.insights) ||
        response.insights.length === 0
      ) {
        throw new Error("Invalid insights format");
      }
      await prisma.keyInsight.createMany({
        data: response.insights.map((insight) => ({
          answerKeyId,
          title: insight.title,
          description: insight.description,
        })),
      });
    } catch (parseError) {
      console.error("Invalid response format:", parseError);
      return [];
    }
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

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    let response: StructureResponse;
    try {
      const response = JSON.parse(responseContent) as StructureResponse;

      if (!response.structure || !Array.isArray(response.structure)) {
        throw new Error("Invalid structure format");
      }

      const cleanedStructure = response.structure.map((item) => ({
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
      console.error("Error parsing structure:", error);
      throw new Error("Failed to parse answer structure");
    }
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

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    let response: HighlightedPointsResponse;
    try {
      response = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return [];
    }

    if (!Array.isArray(response.points)) {
      return [];
    }

    await prisma.highlightedPoint.createMany({
      data: response.points.map((point) => ({
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

    const modelAnswer = await generateModelAnswer(question.content);

    const answerKey = await prisma.answerKey.create({
      data: {
        questionId,
        modelAnswer,
        keyInsights: { create: [] },
        answerStructure: { create: [] },
        highlightedPoints: { create: [] },
      },
    });

    // Run parallel tasks but catch errors individually
    const results = await Promise.allSettled([
      generateKeyInsights(answerKey.id, modelAnswer),
      generateAnswerStructure(answerKey.id, modelAnswer),
      generateHighlightedPoints(answerKey.id, modelAnswer),
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
