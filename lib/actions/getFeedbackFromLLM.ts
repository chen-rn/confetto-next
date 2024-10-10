"use server";

import { openai } from "../apis/openai";

interface GetFeedbackParams {
  question: string;
  answer: string;
}

/**
 * Generates feedback using OpenAI's LLM based on the question and answer.
 *
 * @param params - Object containing 'question' and 'answer'.
 * @returns Feedback string.
 */
export async function getFeedbackFromLLM({ question, answer }: GetFeedbackParams): Promise<string> {
  const prompt = `
    You are a medical school interviewer evaluating a candidate's response during a mock interview session.

    Please provide a detailed evaluation of the answer, including constructive feedback, and grade the answer out of 100 based on the following categories and their respective weights:

    1. **Understanding of Ethical Principles (25%) 🧠**
       - Assess how well the candidate demonstrates knowledge of ethical principles relevant to the question.
    2. **Communication Skills (20%) 🗣️**
       - Evaluate the clarity, coherence, and effectiveness of the communication.
    3. **Professionalism and Empathy (20%) 🤝**
       - Consider the candidate's display of professionalism, empathy, and emotional intelligence.
    4. **Knowledge of Legal and Medical Legislation within Canada (15%) ⚖️**
       - Determine the candidate's understanding of relevant laws and medical regulations in Canada.
    5. **Organization and Structure (20%) 📊**
       - Review the structure and logical flow of the answer.

    Please provide feedback for each category, highlighting strengths and areas for improvement. Conclude with an overall assessment and the final grade out of 100.

    **Question:**
    ${question}

    **Answer:**
    ${answer}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "o1-preview",
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
