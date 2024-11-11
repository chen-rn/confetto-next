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
    console.log("🎙️ Starting audio submission processing for mockId:", mockId);

    // Create or update feedback with PROCESSING status first
    const feedback = await prisma.feedback.upsert({
      where: { mockInterviewId: mockId },
      create: {
        mockInterviewId: mockId,
        status: "PROCESSING",
      },
      update: {
        status: "PROCESSING",
      },
    });

    const mockInterview = await prisma.mockInterview.findUnique({
      where: { id: mockId },
      include: { question: true },
    });

    if (!mockInterview?.recordingUrl) {
      await prisma.feedback.update({
        where: { mockInterviewId: mockId },
        data: { status: "FAILED" },
      });
      throw new Error("No recording URL found");
    }

    console.log(
      "📋 Found mock interview with question:",
      mockInterview.question.content.slice(0, 50) + "..."
    );

    let transcription = mockInterview.recordingTranscription;
    const needsTranscription = !transcription || transcription.trim().length === 0;

    if (needsTranscription) {
      try {
        transcription = await transcribeAudio(mockInterview.recordingUrl);

        await prisma.mockInterview.update({
          where: { id: mockId },
          data: { recordingTranscription: transcription },
        });
      } catch (error) {
        await prisma.feedback.update({
          where: { mockInterviewId: mockId },
          data: { status: "FAILED" },
        });
        throw new Error("Transcription failed");
      }
    }

    // Verify transcription immediately after update
    const verifyTranscription = await prisma.mockInterview.findUnique({
      where: { id: mockId },
      select: { recordingTranscription: true },
    });

    if (!verifyTranscription?.recordingTranscription) {
      await prisma.feedback.update({
        where: { mockInterviewId: mockId },
        data: { status: "FAILED" },
      });
      throw new Error("Transcription verification failed");
    }

    try {
      const feedback = await generateInterviewResult(mockId);

      await prisma.feedback.update({
        where: { id: feedback.id },
        data: { status: "COMPLETED" },
      });

      revalidatePath(ROUTES.MOCK_RESULT(mockId));
      return { success: true, message: "Processing completed" };
    } catch (error) {
      await prisma.feedback.update({
        where: { mockInterviewId: mockId },
        data: { status: "FAILED" },
      });
      throw error;
    }
  } catch (error) {
    // Ensure feedback status is updated to FAILED even for unexpected errors
    await prisma.feedback
      .update({
        where: { mockInterviewId: mockId },
        data: { status: "FAILED" },
      })
      .catch((e) => console.error("Failed to update feedback status:", e));

    console.error("❌ Processing failed:", error);
    revalidatePath(ROUTES.MOCK_RESULT(mockId));

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error instanceof Error ? error.stack : undefined,
    };
  }
}
