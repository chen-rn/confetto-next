"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { transcribeAudio } from "./transcribeAudio";
import { ROUTES } from "@/lib/routes";
import { generateInterviewResult } from "./generateInterviewResult";

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

    let transcription = mockInterview.recordingTranscription;

    // Only transcribe if we don't already have a transcription
    if (!transcription) {
      // Transcribe the audio
      console.log("📝 Starting audio transcription...");
      transcription = await transcribeAudio(mockInterview.recordingUrl);
      console.log("✅ Transcription completed");

      // Update the mock interview with the transcription
      await prisma.mockInterview.update({
        where: { id: mockId },
        data: { recordingTranscription: transcription },
      });
      console.log("💾 Transcription saved to database");
    } else {
      console.log("📝 Using existing transcription");
    }

    if (!mockInterview.question) {
      console.warn("⚠️ Failed to find associated question");
      throw new Error("Failed to find associated question");
    }

    console.log("❓ Associated question retrieved");

    // Generate feedback using LLM
    console.log("🤖 Generating feedback using LLM...");
    await generateInterviewResult(mockId);

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
