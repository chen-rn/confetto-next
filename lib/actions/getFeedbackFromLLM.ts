"use server";

import { openai } from "../apis/openai";

/**
 * Generates feedback using OpenAI's GPT-4 based on the question and answer.
 *
 * @param params - Object containing 'question' and 'answer'.
 * @returns Feedback string.
 */
export async function getFeedbackFromLLM({
  question,
  answer,
}: {
  question: string;
  answer: string;
}): Promise<string> {
  const prompt = `
    The following is a medical school interview practice session.

    Please grade the answer out of 100 based on the following categories and their respective weights:

    1. Understanding of ethical principles (25%)
    2. Communication skills (20%)
    3. Professionalism and empathy (20%)
    4. Legal and medical legislation within the jurisdiction of Canada (15%)
    5. Organization and structure (20%)

    Additionally, provide detailed feedback with actionable insights.

    Question:
    ${question}

    Answer:
    ${answer}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    if (content === null) {
      throw new Error("Unexpected null content from OpenAI API");
    }

    return content;
  } catch (error) {
    console.error("LLM feedback generation error:", error);
    throw new Error("Failed to generate feedback.");
  }
}
