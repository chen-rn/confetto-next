"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../apis/prisma";
import { transcribeAudio } from "./transcribeAudio";
import { getFeedbackFromLLM } from "./getFeedbackFromLLM";

/**
 * Processes the audio submission by saving the URL, transcribing the audio, and generating feedback.
 *
 * @param url - URL of the uploaded audio recording.
 * @param mockId - ID of the mock interview.
 * @returns An object indicating success or failure.
 */
export async function processAudioSubmission(url: string, mockId: string) {
  try {
    // Update the mock interview with the audio URL
    const updatedMock = await prisma.mockInterview.update({
      where: { id: mockId },
      data: { recordingUrl: url },
    });

    if (!updatedMock) {
      throw new Error("Failed to update mock interview with audio URL");
    }

    // Transcribe the audio
    const transcription = await transcribeAudio(url);

    // Update the mock interview with the transcription
    await prisma.mockInterview.update({
      where: { id: mockId },
      data: { recordingTranscription: transcription },
    });

    // Retrieve the associated question
    const question = await prisma.question.findUnique({
      where: { id: updatedMock.questionId },
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
        mockInterviewId: mockId,
      },
    });

    // Revalidate the mock interview page to display the latest data
    revalidatePath(`/mock/${mockId}`);

    return {
      success: true,
      message: "Audio processed and feedback generated successfully.",
    };
  } catch (error) {
    console.error("Error processing audio submission:", error);
    return { success: false, message: "Failed to process audio." };
  }
}
