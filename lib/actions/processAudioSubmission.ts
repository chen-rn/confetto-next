"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../apis/prisma";
import { transcribeAudio } from "./transcribeAudio";
import { getFeedbackFromLLM } from "./getFeedbackFromLLM";
import { ROUTES } from "@/lib/routes";

/**
 * Processes the audio submission by saving the URL, transcribing the audio, and generating feedback.
 *
 * @param url - URL of the uploaded audio recording.
 * @param mockId - ID of the mock interview.
 * @returns An object indicating success or failure.
 */
export async function processAudioSubmission(url: string, mockId: string) {
  try {
    console.log("🎙️ Starting audio submission processing...");

    // Update the mock interview with the audio URL
    const updatedMock = await prisma.mockInterview.update({
      where: { id: mockId },
      data: { recordingUrl: url },
    });

    if (!updatedMock) {
      console.warn("⚠️ Failed to update mock interview with audio URL");
      throw new Error("Failed to update mock interview with audio URL");
    }

    console.log("🔊 Audio URL updated successfully");

    // Transcribe the audio
    console.log("📝 Starting audio transcription...");
    const transcription = await transcribeAudio(url);
    console.log("✅ Transcription completed");

    // Update the mock interview with the transcription
    await prisma.mockInterview.update({
      where: { id: mockId },
      data: { recordingTranscription: transcription },
    });
    console.log("💾 Transcription saved to database");

    // Retrieve the associated question
    const question = await prisma.question.findUnique({
      where: { id: updatedMock.questionId },
    });

    if (!question) {
      console.warn("⚠️ Failed to find associated question");
      throw new Error("Failed to find associated question");
    }

    console.log("❓ Associated question retrieved");

    // Generate feedback using LLM
    console.log("🤖 Generating feedback using LLM...");
    const feedback = await getFeedbackFromLLM({
      question: question.content,
      answer: transcription,
    });
    console.log("✅ Feedback generated");

    // Create a feedback entry
    await prisma.feedback.create({
      data: {
        content: feedback || "No feedback available.",
        mockInterviewId: mockId,
      },
    });
    console.log("💾 Feedback saved to database");

    // Revalidate the mock interview page to display the latest data
    revalidatePath(ROUTES.MOCK(mockId));
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
