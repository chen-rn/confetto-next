"use server";

import { replicate } from "../apis/replicate";

/**
 * Transcribes audio using Replicate's Whisper model.
 *
 * @param audioUrl - URL of the audio file to transcribe.
 * @returns Transcribed text.
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
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
