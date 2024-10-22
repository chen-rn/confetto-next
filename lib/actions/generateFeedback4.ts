"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../apis/openai";
import { prisma } from "../apis/prisma";
import { generateCriteria } from "./generateCriteria";

interface GenerateFeedbackParams {
  questionId: string;
  answer: string;
  mockInterviewId: string;
}

export async function generateFeedback4({
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

  // Fetch the stored prompt
  const storedPrompt = await prisma.feedbackPrompt.findUnique({
    where: { name: "generateFeedback" },
  });

  if (!storedPrompt) {
    throw new Error("Feedback prompt not found");
  }

  let criteria = "";
  if (!question.evaluationCriteria) {
    // throw new Error("Evaluation criteria not found");
    //we'll generate one on the spot given our generateCriteria function
    criteria = await generateCriteria(question.content);
    //also save the criteria to the question
    await prisma.question.update({
      where: { id: questionId },
      data: { evaluationCriteria: criteria },
    });
  } else {
    criteria = question.evaluationCriteria;
  }

  const initialPrompt = storedPrompt.prompt
    .replace("${question}", question.content)
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
