"use server";

import { openrouter } from "../openrouter";
import { prisma } from "../prisma";
import { z } from "zod";
import { validateAIResponse } from "../utils/ai-validation";

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
  const systemPrompt = `You are a medical school applicant preparing for an MMI. Craft an authentic answer demonstrating genuine reasoning.

Key requirements:
- Use active first-person language ("I believe..." not "I would believe")
- Include specific, realistic details related to the scenario
- Naturally reveal your thought process
- Balance confidence with humility
- Maintain a conversational yet professional tone
- Use appropriate emotions (concern, empathy)
- Organize into logically flowing paragraphs
- Aim for approximately 300 words`;

  const userPrompt = `Provide a realistic MMI answer for the following scenario:

"${content}"

Imagine you're in this situation. What are your immediate thoughts? What specific actions would you take? What matters most?

Please provide only the answer with natural paragraph breaks, no additional formatting.`;
  try {
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
    const systemPrompt = `You are an MMI expert who helps candidates understand the core ethical principles and requirements for specific scenarios.

Key Requirements:
1. Identify the 2-3 MOST crucial ethical requirements or principles specific to this scenario
2. For each insight:
   - State the core requirement/principle
   - Explain why it's essential
   - Give concrete examples
Focus on helping candidates understand how they should present this during the interview.
`;

    const userPrompt = `Identify the 2-3 most crucial ethical requirements that must be met for the action to be ethical in this scenario.

Question: ${modelAnswer}

You must respond with valid JSON in this exact format, with NO line breaks in the description:
{
  "insights": [
    {
      "title": "Core ethical requirement. (3-10 words)",
      "description": "Why this is essential. (2-3 sentences)"
    }
  ]
}

Important: Keep all descriptions on a single line.`;

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
    const systemPrompt = `You are an MMI expert who helps medical school candidates structure their answers effectively.

Key Requirements:
1. Create a 4-5 minute answer structure with 4-5 distinct sections
2. Each section must be 45-90 seconds
3. Total time should add up to 4-5 minutes
4. Each section must include specific guidance for content and delivery

Structure should follow this pattern:
1. Opening (45s): Acknowledge question, show understanding, establish credibility
2. Framework (60s): Present ethical principles, decision criteria, or analytical approach
3. Application (90s): Apply framework to specific scenario, use examples
4. Considerations (45s): Address stakeholders, challenges, alternatives
5. Conclusion (45s): Summarize key points, reaffirm position`;

    const userPrompt = `Analyze this model answer and create a detailed 4-5 minute structure:

${modelAnswer}

You must respond with valid JSON in this exact format:
{
  "structure": [
    {
      "title": "Opening Statement (45 seconds)",
      "description": "Acknowledge the ethical tension between [X] and [Y]. Establish credibility through relevant experience. Show understanding of key stakeholders."
    },
    {
      "title": "Ethical Framework (60 seconds)",
      "description": "Present key principles: [principle 1] and [principle 2]. Explain how these principles apply to the scenario. Introduce decision-making criteria."
    },
    {
      "title": "Practical Application (90 seconds)",
      "description": "Apply framework to specific scenario. Use concrete examples. Discuss implementation steps and safeguards."
    },
    {
      "title": "Stakeholder Analysis (45 seconds)",
      "description": "Consider impact on all stakeholders. Address potential challenges and mitigation strategies."
    },
    {
      "title": "Balanced Conclusion (45 seconds)",
      "description": "Reaffirm position while acknowledging complexity. Summarize key points and practical next steps."
    }
  ]
}

Each section must include:
1. Clear title with timing in seconds
2. Description that covers key content, transitions, and approach
3. Total time should be between 4-5 minutes (285-300 seconds)`;

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
    const systemPrompt = `You are an MMI expert who helps candidates identify and understand exemplary elements in model answers.

Key Requirements:
1. Each highlighted point must:
   - Be a specific phrase or sentence from the answer
   - Connect to a key insight or principle
   - Include detailed explanation of why it's effective
   - Provide suggestions for adaptation

2. Focus on identifying:
   - Strong ethical reasoning
   - Personal experience integration
   - Stakeholder consideration
   - Practical implementation
   - Professional communication

3. For each point explain:
   - Why it's effective
   - How it demonstrates the principle
   - How to adapt this approach to other scenarios
   - Common mistakes to avoid`;

    const userPrompt = `Analyze this model answer and identify 3-4 exemplary phrases or sentences:

${modelAnswer}

For each highlighted point, provide:
1. The exact text from the answer
2. The key insight or principle it demonstrates
3. Detailed explanation of why it's effective
4. How to adapt this approach to other scenarios

You must respond with valid JSON in this exact format:
{
  "points": [
    {
      "text": "Direct quote from the answer",
      "insight": "Key principle or insight demonstrated",
      "explanation": "Why this is effective and how to adapt it"
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
