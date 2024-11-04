"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../openai";
import { prisma } from "../prisma";
import { generateCriteria } from "./generateCriteria";
import { openrouter } from "../openrouter";

interface GenerateFeedbackParams {
  questionId: string;
  answer: string;
  mockInterviewId: string;
}

interface ProcessedFeedback {
  overallScore: number;
  categoryScores: {
    [key: string]: number;
  };
  strongPoints: string[];
  keyImprovements: string[];
  nextTimeTip: string[];
}

async function processFeedback(detailedFeedback: string): Promise<ProcessedFeedback> {
  const processPrompt = `You are an expert MMI coach helping medical school applicants improve. Transform this detailed evaluation into clear, actionable feedback.

Your feedback should include:

1. Overall Score in clear format
2. Category scores formatted for visual display
3. "Strong Points" (✓):
   - Pick 2-3 best moments
   - Include brief relevant quotes from their response
   - Focus on what worked well

4. "Key Improvements" (→):
   - List top 3 highest-impact improvements
   - Make each one specific and actionable
   - Keep explanations brief but clear

5. "Tip for Next Time" (💡):
   - Provide a clear framework/structure
   - Break it down into 4-5 key points
   - Make it specific to this type of question

Keep the tone encouraging but direct. Focus on what will help them improve most in their next attempt.

Detailed Evaluation:
${detailedFeedback}

Respond in the following JSON format:
{
  "overallScore": number (1-100),
  "categoryScores": {
    "communication": number,
    "structure": number,
    "content": number,
    "empathy": number
  },
  "strongPoints": string[],
  "keyImprovements": string[],
  "nextTimeTip": string[]
}`;

  try {
    const response = await openrouter.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet:beta",
      messages: [{ role: "user", content: processPrompt }],
      response_format: { type: "json_object" },
    });

    const processedFeedback = JSON.parse(response.choices[0].message.content || "{}");
    return processedFeedback as ProcessedFeedback;
  } catch (error) {
    console.error("Error processing feedback:", error);
    throw new Error("Failed to process feedback");
  }
}

const FEEDBACK_PROMPT = `You are an expert MMI evaluator for medical school admissions.

Question: \${question}
Candidate's Response: \${answer}
Evaluation Criteria and Weights:\${criteria}

Instructions:

Evaluate the candidate's verbal response based on the provided criteria. For each criterion:

Assign a score based on the given weight.
Identify specific examples from their response that earned or lost points, integrating these examples smoothly into your feedback.
Provide clear, actionable advice on how the candidate can improve, using encouraging and positive language.
Use second-person language to personalize the feedback.
Highlight the impact that making these improvements will have on the candidate's performance.
Focus on the most critical feedback, keeping it concise and avoiding redundancy.
Maintain a consistent and clear format for readability.
Prioritize the focus areas, indicating which are most important to address first.
Include a "Next Steps" section with actionable recommendations for the candidate.
Add an overall summary or conclusion that reinforces the main points and motivates the candidate.
Format:

Overall Score: X/100

Scoring Breakdown:

[Criterion Name]: X/\${weight}

What Worked:

[Integrate specific examples smoothly into your feedback, using positive language.]
What Could Be Better:

[Provide clear, actionable advice on how to improve, using second-person language and highlighting the impact of these improvements.]
(Repeat for each criterion.)

Key Strengths (Top 3):

[Most significant strength]: [Provide specific examples and explain why this is a strength.]

[Second strength]: [Details.]

[Third strength]: [Details.]

Focus Areas (Top 3):

[Most critical area for improvement]: [Provide clear, actionable steps tied to the criteria, and explain the impact of improvement.]

[Second area]: [Details.]

[Third area]: [Details.]

Next Steps:

[Offer specific recommendations or actions the candidate can take to improve in the focus areas.]
Overall Summary:

[Provide an encouraging summary that reinforces the main points, highlights the candidate's potential, and motivates them to act on the feedback.]
`;

export async function generateFeedback({
  questionId,
  answer,
  mockInterviewId,
}: GenerateFeedbackParams): Promise<Feedback> {
  // Fetch the question from the database
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  let criteria = "";
  if (!question.evaluationCriteria) {
    criteria = await generateCriteria(question.content);
    await prisma.question.update({
      where: { id: questionId },
      data: { evaluationCriteria: criteria },
    });
  } else {
    criteria = question.evaluationCriteria;
  }

  // Replace the DB prompt fetch with the hardcoded prompt
  const initialPrompt = FEEDBACK_PROMPT.replace("${question}", question.content)
    .replace("${answer}", answer)
    .replace("${criteria}", criteria);

  try {
    console.log("Starting feedback generation process...");

    // Get feedback from OpenAI
    console.log("Requesting feedback from OpenAI...");
    const openaiResponse = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: initialPrompt }],
    });
    console.log("OpenAI response received.");

    const feedback = openaiResponse.choices[0].message.content;
    if (!feedback) {
      console.error("Error: Unexpected null content from OpenAI API");
      throw new Error("Unexpected null content from OpenAI API");
    }

    // Process the feedback
    const processedFeedback = await processFeedback(feedback);

    // Save both the detailed and processed feedback
    const savedFeedback = await prisma.feedback.create({
      data: {
        overallScore: processedFeedback.overallScore,
        overallFeedback: feedback,
        processedFeedback: JSON.stringify(processedFeedback), // Add this field to your schema
        mockInterviewId,
      },
    });

    return savedFeedback;
  } catch (error) {
    console.error("LLM feedback generation error:", error);
    throw new Error("Failed to generate or process feedback.");
  }
}
