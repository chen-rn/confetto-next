"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../openai";
import { prisma } from "../prisma";

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
  // Fetch the stored prompt
  const storedPrompt = await prisma.feedbackPrompt.findUnique({
    where: { name: "generateFeedback" },
  });

  if (!storedPrompt) {
    throw new Error("Feedback prompt not found");
  }

  const initialPrompt = storedPrompt.prompt
    .replace("${question}", question)
    .replace("${answer}", answer);

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
    console.log("Feedback:", feedback);

    // Save the feedback to the database
    console.log("Saving feedback to the database...");
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
