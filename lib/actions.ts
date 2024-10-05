"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function createMockSession(formData: FormData) {
  const questionId = formData.get("questionId");
  const userId = formData.get("userId");

  if (!questionId || typeof questionId !== "string" || !userId || typeof userId !== "string") {
    throw new Error("Invalid question ID or user ID");
  }

  const createdSession = await prisma.practiceSession.create({
    data: {
      userId: userId,
      questionId: questionId,
      startTime: new Date(),
    },
  });

  const practiceSessionId = createdSession.id;

  revalidatePath("/create-session");
  redirect(`/session/${practiceSessionId}`); // Redirect to the specific session page after creation
}

export async function saveAudioUrl(url: string, sessionId: string) {
  try {
    const updatedSession = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { recordingUrl: url },
    });

    if (!updatedSession) {
      throw new Error("Failed to update session with audio URL");
    }

    // Transcribe the audio using Replicate
    const transcription = await transcribeAudio(url);

    // Update the session with the transcription
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { recordingTranscription: transcription },
    });

    revalidatePath(`/session/${sessionId}`);
    return { success: true, message: "Audio URL saved and transcribed successfully" };
  } catch (error) {
    console.error("Error saving audio URL or transcribing:", error);
    return { success: false, message: "Failed to save audio URL or transcribe" };
  }
}

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

    if (typeof output === "object" && output !== null && "text" in output) {
      return output.text as string;
    }

    throw new Error("Unexpected output format from transcription API");
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}
