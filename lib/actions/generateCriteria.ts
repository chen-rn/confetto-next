// Start of Selection
"use server";

import { openai } from "../openai";
import { extractCriteriaAndWeights } from "./extractCriteriaAndWeights";

export async function generateCriteria(questionContent: string): Promise<string> {
  const initialPrompt = `
  You are an expert MMI (Multiple Mini Interview) evaluator for medical school admissions.
  
  **Task:**
  
  Evaluate a candidate's response to the following question by separating your evaluation criteria into **"How You Say It"** and **"What You Say"**.
  
  ---
  
  **Question:**
  
  ${questionContent}
  
  ---
  
  **Evaluation Criteria:**
  
  **How You Say It** (consistent for all questions):
  1. Communication Skills
  2. Professionalism and Demeanor
  3. Empathy and Emotional Intelligence
  
  **What You Say** (select the most relevant for each question):
  1. Critical Thinking and Problem-Solving
  2. Ethical Reasoning, Integrity, and Honesty
  3. Awareness of Healthcare Issues
  4. Adaptability, Resilience, and Coping Skills
  5. Self-Awareness and Reflectiveness
  6. Inclusivity and Cultural Sensitivity
  7. Teamwork and Collaboration
  8. Commitment and Motivation for Medicine
  9. Time Management and Organizational Skills
  10. Leadership and Initiative
  11. Patient-Centeredness
  
  ---
  
  **Instructions:**
  
  - **Select** the most relevant criteria from **"What You Say"** for this question.
  - **Assign a weight** to each criterion so that the total sums up to **100**.
  - Provide your response in the following format:
  
  **How You Say It**
  1. [Criterion Name]: [Weight]
  2. [Criterion Name]: [Weight]
  3. [Criterion Name]: [Weight]
  
  **What You Say**
  1. [Criterion Name]: [Weight]
  2. [Criterion Name]: [Weight]
  3. [Criterion Name]: [Weight]
  
  **Total: 100**
  
  - **Briefly explain** why you chose these criteria and assigned these weights.
  
  `;

  try {
    console.log("Starting question analysis process...");

    // Get analysis from OpenAI
    console.log("Requesting analysis from OpenAI...");
    const openaiResponse = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: initialPrompt }],
    });
    console.log("OpenAI response received.");

    const analysis = openaiResponse.choices[0].message.content;
    if (!analysis) {
      console.error("Error: Unexpected null content from OpenAI API");
      throw new Error("Unexpected null content from OpenAI API");
    }
    console.log("Generated analysis:", analysis);

    // const criteria = extractCriteriaAndWeights(analysis);

    return analysis;
  } catch (error) {
    console.error("LLM question analysis error:", error);
    throw new Error("Failed to analyze the question.");
  }
}
