"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../openai";
import { prisma } from "../prisma";

interface GenerateFeedbackParams {
  question: string;
  answer: string;
  mockInterviewId: string;
}

export async function generateFeedback3({
  question,
  answer,
  mockInterviewId,
}: GenerateFeedbackParams): Promise<Feedback> {
  const prompt = `
    You are an evaluator for Multiple Mini Interview (MMI) responses in a medical school admissions process. Your task is to provide a comprehensive evaluation of the candidate's response.

    Question:
    ${question}

    Candidate's Response:
    ${answer}

    Please evaluate the response and provide:

    1. An overall score out of 100.
    2. Break down the evaluation into 3-5 relevant categories based on the specific question and response. For each category:
       - Provide a brief explanation
       - Assign a score out of 20

    Finally, offer constructive feedback on areas of strength and potential improvement.

    Format your response as follows:

    Overall Score: X

    [Category 1]: X
    [Brief explanation]

    [Category 2]: X
    [Brief explanation]

    [Category 3]: X
    [Brief explanation]

    [Additional categories if necessary]

    Strengths:
    [List key strengths]

    Areas for Improvement:
    [List areas that need improvement]

    Additional Comments:
    [Any other relevant observations or advice]
  `;

  try {
    console.log("Starting feedback generation process...");

    const openaiResponse = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = openaiResponse.choices[0].message.content;
    if (!feedback) {
      throw new Error("Unexpected null content from OpenAI API");
    }

    // Save the feedback to the database
    const savedFeedback = await prisma.feedback.create({
      data: {
        overallScore: 0, // We're not extracting scores, so set to 0 or null

        overallFeedback: feedback,
        mockInterviewId,
      },
    });

    console.log("Feedback saved successfully:", savedFeedback);
    return savedFeedback;
  } catch (error) {
    console.error("LLM feedback generation error:", error);
    throw new Error("Failed to generate or process feedback.");
  }
}
