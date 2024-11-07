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

async function generateModelAnswer(content: string, scoringCriteria: ScoringCriteria[]) {
  try {
    const systemPrompt = `You are an expert medical school interviewer and physician with extensive MMI experience. Create well-structured, impactful model answers for MMI interviews.

Requirements:
- Response should be 3-4 minutes when spoken (~400-500 words)
- Must include specific medical examples or case studies
- Structure: 
  * Opening (10%): State your position and framework
  * Analysis (70%): 2-3 main arguments with evidence
  * Implementation (15%): Practical steps
  * Conclusion (5%): Reinforce position
- Use proper paragraph breaks with \n\n
- Demonstrate medical ethics principles (autonomy, beneficence, non-maleficence, justice)
- Use STAR method for examples (Situation, Task, Action, Result)
- Include quantifiable metrics where relevant`;

    const userPrompt = `Create a model answer for this MMI question: "${content}"

The answer will be evaluated on these criteria:
${scoringCriteria.map((c) => `- ${c.name} (${c.maxPoints} points): ${c.description}`).join("\n")}

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

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    console.log("Raw AI response:", responseContent); // Debug log

    let response: ModelAnswerResponse;
    try {
      // Parse the JSON directly without cleaning
      response = JSON.parse(responseContent);

      if (!response.modelAnswer) {
        throw new Error("Response missing modelAnswer field");
      }
    } catch (parseError) {
      console.error("Parse error details:", parseError);
      console.error("Raw content:", responseContent);

      // If it's a valid JSON string but just has formatting issues
      if (responseContent.includes('"modelAnswer"')) {
        try {
          // Try to extract just the model answer content
          const match = responseContent.match(/"modelAnswer"\s*:\s*"([^"]*)"/);
          if (match?.[1]) {
            return match[1];
          }
        } catch (e) {
          console.error("Regex extraction failed:", e);
        }
      }

      // Last resort: return the raw content
      return responseContent;
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

Requirements:
- Time each section precisely
- Include transition phrases
- Highlight key phrases/words to emphasize
- Note body language cues
- Include pausing points for emphasis`;

    const userPrompt = `Break this model answer into a realistic 4-5 minute structure:

${modelAnswer}

Respond with a JSON object like this:
{
  "structure": [
    {
      "title": "Initial Framework (60s)",
      "description": "Acknowledge question, state ethical principles, outline structured approach"
    },
    {
      "title": "Main Analysis (120s)",
      "description": "Deep dive into 2-3 key considerations with specific examples and evidence"
    },
    {
      "title": "Application/Solution (60s)",
      "description": "Develop detailed action steps and address potential challenges"
    },
    {
      "title": "Conclusion (45s)",
      "description": "Summarize key points, reinforce ethical principles, and provide final recommendation"
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
      response = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return [];
    }

    if (!Array.isArray(response.structure)) {
      return [];
    }

    await prisma.answerStructure.createMany({
      data: response.structure.map((item) => ({
        answerKeyId,
        section: item.title,
        purpose: item.description,
      })),
    });
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

    const modelAnswer = await generateModelAnswer(question.content, question.scoringCriteria);

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
