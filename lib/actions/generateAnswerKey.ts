"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";
import { z } from "zod";
import { validateAIResponse } from "../utils/ai-validation";

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
    const systemPrompt = `You are an experienced medical resident giving an MMI answer. Create a response that feels authentic and shows real-world judgment.

Key requirements:
- Use active, present-tense language ("I tell the attending..." not "I would tell")
- Include a specific, realistic scenario detail in your answer
- Show your thought process naturally, not in formal steps
- Balance confidence with appropriate humility
- Keep medical language conversational
- Use emotion appropriately (concern, empathy, determination)
- Break into natural paragraphs that flow logically
- ~300 words total`;

    const userPrompt = `Give a realistic MMI answer for this scenario: "${content}"

Imagine you're actually in this situation. What's your gut reaction? What specific actions do you take? What matters most?

Provide just the answer with natural paragraph breaks, no additional formatting.`;

    const completion = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const modelAnswer =
      completion.choices[0]?.message?.content || "Failed to generate model answer";
    return { modelAnswer };
  } catch (error) {
    console.error("Error in generateModelAnswer:", error);
    throw new Error("Failed to generate model answer");
  }
}

async function generateKeyInsights(answerKeyId: string, modelAnswer: string) {
  try {
    const systemPrompt = `You are an MMI expert who trains medical school candidates. Extract key insights that would help other candidates improve their answers.

Identify insights that show:
- Practical application of ethical reasoning
- Clear decision-making process
- Effective communication strategies
- Professional judgment
- Consideration of multiple perspectives`;

    const userPrompt = `Analyze this model answer and identify 3 specific, actionable insights:

${modelAnswer}

You must respond with valid JSON in this exact format:
{
  "insights": [
    {
      "title": "Actionable tip",
      "description": "How to implement this in your own answer"
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

    const userPrompt = `Identify 2-3 key moments that demonstrate the main requirements of the question:

${modelAnswer}

You must respond with valid JSON in this exact format:
{
  "points": [
    {
      "text": "Direct quote from answer",
      "insight": "Main aspect addressed",
      "explanation": "How this demonstrates understanding"
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
