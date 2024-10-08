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
    The following is a medical school interview practice session.

    Please grade the answer out of 100 based on the following categories and their respective weights:

    1. Understanding of ethical principles (25%) 🧠
    2. Communication skills (20%) 🗣️
    3. Professionalism and empathy (20%) 🤝
    4. Legal and medical legislation within Canada (15%) ⚖️
    5. Organization and structure (20%) 📊

    Additionally, provide detailed feedback with actionable insights. 💡
    When giving feedback, if it's about something specific, quote the user's mistake.
    Please format your response in Markdown and use emojis for visual enhancement. 🎨
    Start your response with the total score as an H1 heading.

    ---
    # XX/100

    ## 📊 **Score Breakdown**
    ---
    
    1. **Understanding of ethical principles** 🧠: **XX/25**
    2. **Communication skills** 🗣️: **XX/20**
    3. **Professionalism and empathy** 🤝: **XX/20**
    4. **Legal and medical legislation within Canada** ⚖️: **XX/15**
    5. **Organization and structure** 📊: **XX/20**
    
    
    ## 💡 **Detailed Feedback**
    ---
    This is where you'll go into a bit more detail on each of those categories.
    You can use emojis to highlight specific points or provide examples.
    ...    

    **Question:**
    ${question}

    **Answer:**
    ${answer}

    Please ensure that no other headings are larger than H2 in your response.
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
