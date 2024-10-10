"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../apis/openai";
import { openrouter } from "../apis/openrouter";
import { prisma } from "../apis/prisma";

interface GenerateFeedbackParams {
  question: string;
  answer: string;
  mockInterviewId: string;
}

export async function generateFeedback({
  question,
  answer,
  mockInterviewId,
}: GenerateFeedbackParams): Promise<Feedback> {
  const initialPrompt = `
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
    console.log("Starting feedback generation process...");

    // Step 1: Get initial feedback from OpenAI
    console.log("Step 1: Requesting feedback from OpenAI...");
    const openaiResponse = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: initialPrompt }],
    });
    console.log("OpenAI response received.");

    const initialFeedback = openaiResponse.choices[0].message.content;
    if (!initialFeedback) {
      console.error("Error: Unexpected null content from OpenAI API");
      throw new Error("Unexpected null content from OpenAI API");
    }
    console.log("Initial feedback:", initialFeedback);

    // Step 2: Extract structured data using Gemini 1.5 Flash via OpenRouter
    console.log("Step 2: Extracting structured data using OpenRouter...");
    const extractionPrompt = `
      Given the following feedback, extract the scores and feedback for each category, as well as the overall score and feedback.

      Return the data in **strictly JSON format**, and make sure the response contains **only the JSON object** without any additional text or formatting.

      Feedback:
      ${initialFeedback}

      Expected JSON structure:
      {
        "ethicalPrinciplesUnderstanding": number,
        "ethicalPrinciplesFeedback": "string",
        "communicationSkills": number,
        "communicationSkillsFeedback": "string",
        "professionalismAndEmpathy": number,
        "professionalismAndEmpathyFeedback": "string",
        "legalAndMedicalLegislation": number,
        "legalAndMedicalLegislationFeedback": "string",
        "organizationAndStructure": number,
        "organizationAndStructureFeedback": "string",
        "overallScore": number,
        "overallFeedback": "string"
      }
    `;

    const openrouterResponse = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5",
      messages: [{ role: "user", content: extractionPrompt }],
    });
    console.log("OpenRouter response received.");

    let extractedContent = openrouterResponse.choices[0].message.content;
    if (!extractedContent) {
      console.error("Error: Unexpected null content from OpenRouter API");
      throw new Error("Unexpected null content from OpenRouter API");
    }
    console.log("Extracted content:", extractedContent);

    // Post-processing: Extract JSON from response
    extractedContent = extractJSON(extractedContent);
    console.log("Extracted JSON content:", extractedContent);

    const extractedData = JSON.parse(extractedContent) as Omit<Feedback, "rawContent">;
    console.log("Parsed extracted data:", extractedData);

    // Step 3: Save the feedback to the database
    console.log("Step 3: Saving feedback to the database...");
    const savedFeedback = await prisma.feedback.create({
      data: {
        ...extractedData,
        rawContent: initialFeedback,
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

/**
 * Helper function to extract JSON content from a text string.
 */
function extractJSON(text: string): string {
  const jsonRegex = /{[\s\S]*}/;
  const match = text.match(jsonRegex);
  if (match) {
    return match[0];
  }
  throw new Error("Failed to extract JSON from the LLM response.");
}
