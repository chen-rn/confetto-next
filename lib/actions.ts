// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import Replicate from "replicate";
import openai from "./openai";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Creates a new practice session for the user.
 *
 * @param formData - Contains 'questionId' and 'userId'.
 */
export async function createMockSession(formData: FormData) {
  const questionId = formData.get("questionId");
  const userId = formData.get("userId");

  if (!questionId || typeof questionId !== "string" || !userId || typeof userId !== "string") {
    throw new Error("Invalid question ID or user ID");
  }

  try {
    const createdSession = await prisma.practiceSession.create({
      data: {
        userId,
        questionId,
      },
    });

    revalidatePath("/create-session");
    redirect(`/session/${createdSession.id}`);
  } catch (error) {
    console.error("Error creating mock session:", error);
    throw new Error("Failed to create mock session");
  }
}

/**
 * Saves the uploaded audio URL, transcribes it, and generates feedback.
 *
 * @param url - URL of the uploaded audio recording.
 * @param sessionId - ID of the practice session.
 * @returns An object indicating success or failure.
 */
export async function saveAudioUrl(url: string, sessionId: string) {
  try {
    // Update the session with the audio URL
    const updatedSession = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { recordingUrl: url },
    });

    if (!updatedSession) {
      throw new Error("Failed to update session with audio URL");
    }

    // Transcribe the audio
    const transcription = await transcribeAudio(url);

    // Update the session with the transcription
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { recordingTranscription: transcription },
    });

    // Retrieve the associated question
    const question = await prisma.question.findUnique({
      where: { id: updatedSession.questionId },
    });

    if (!question) {
      throw new Error("Failed to find associated question");
    }

    // Generate feedback using LLM
    const feedback = await getFeedbackFromLLM({
      question: question.content,
      answer: transcription,
    });

    // Create a feedback entry
    await prisma.feedback.create({
      data: {
        content: feedback || "No feedback available.",
        practiceSessionId: sessionId,
      },
    });

    // Revalidate the session page to display the latest data
    revalidatePath(`/session/${sessionId}`);

    return {
      success: true,
      message: "Audio saved, transcribed, and feedback generated successfully.",
    };
  } catch (error) {
    console.error("Error processing audio URL:", error);
    return { success: false, message: "Failed to process audio." };
  }
}

/**
 * Transcribes audio using Replicate's Whisper model.
 *
 * @param audioUrl - URL of the audio file to transcribe.
 * @returns Transcribed text.
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    const input = {
      audio: audioUrl,
      batch_size: 64,
    };

    const output = await replicate.run(
      "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
      { input }
    );

    if (output && typeof output === "object" && "text" in output) {
      return output.text as string;
    }

    throw new Error("Unexpected format received from transcription API.");
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

/**
 * Generates feedback using OpenAI's GPT-4 based on the question and answer.
 *
 * @param params - Object containing 'question' and 'answer'.
 * @returns Feedback string.
 */
async function getFeedbackFromLLM({
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
