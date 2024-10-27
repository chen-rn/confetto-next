"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { transcribeAudio } from "./transcribeAudio";
import { generateFeedback } from "./generateFeedback";
import { ROUTES } from "@/lib/routes";
import { generateFeedback2 } from "./generateFeedback2";
import { generateFeedback3 } from "./generateFeedback3";
import { generateFeedback4 } from "./generateFeedback4";

/**
 * Processes the audio submission by transcribing the audio and generating feedback.
 *
 * @param mockId - ID of the mock interview.
 * @returns An object indicating success or failure.
 */
export async function processAudioSubmission(mockId: string) {
  try {
    console.log("🎙️ Starting audio submission processing...");

    // Retrieve the mock interview
    const mockInterview = await prisma.mockInterview.findUnique({
      where: { id: mockId },
      include: { question: true },
    });

    if (!mockInterview || !mockInterview.recordingUrl) {
      console.warn("⚠️ Failed to find mock interview or recording URL");
      throw new Error("Failed to find mock interview or recording URL");
    }

    console.log("🔊 Found mock interview with audio URL");

    // Transcribe the audio
    console.log("📝 Starting audio transcription...");
    const transcription = await transcribeAudio(mockInterview.recordingUrl);
    console.log("✅ Transcription completed");

    // Update the mock interview with the transcription
    await prisma.mockInterview.update({
      where: { id: mockId },
      data: { recordingTranscription: transcription },
    });
    console.log("💾 Transcription saved to database");

    if (!mockInterview.question) {
      console.warn("⚠️ Failed to find associated question");
      throw new Error("Failed to find associated question");
    }

    console.log("❓ Associated question retrieved");

    // Generate feedback using LLM
    console.log("🤖 Generating feedback using LLM...");
    await generateFeedback4({
      mockInterviewId: mockId,
      questionId: mockInterview.questionId,
      answer: transcription,
    });

    // Revalidate the mock interview page to display the latest data
    revalidatePath(ROUTES.MOCK_RESULT(mockId));
    console.log("🔄 Mock interview page revalidated");

    console.log("🎉 Audio processing completed successfully");
    return {
      success: true,
      message: "Audio processed and feedback generated successfully.",
    };
  } catch (error) {
    console.error("❌ Error processing audio submission:", error);
    return { success: false, message: "Failed to process audio." };
  }
}
