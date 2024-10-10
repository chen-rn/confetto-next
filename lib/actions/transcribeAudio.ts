"use server";

import { openai } from "../apis/openai";
import { replicate } from "../apis/replicate";

/**
 * Transcribes audio using OpenAI's Whisper model, with Replicate as a backup.
 *
 * @param audioUrl - URL of the audio file to transcribe.
 * @returns Transcribed text.
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl);
    const blob = await response.blob();

    // Create a FormData object and append the blob as a file
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

    // Make the API call using fetch
    const openaiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const result = await openaiResponse.json();
    return result.text;
  } catch (error) {
    console.error("OpenAI transcription error:", error);
    return fallbackToReplicate(audioUrl);
  }
}

async function fallbackToReplicate(audioUrl: string): Promise<string> {
  try {
    console.log("Falling back to Replicate for transcription...");
    const output = await replicate.run(
      "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
      { input: { audio: audioUrl, batch_size: 64 } }
    );

    if (output && typeof output === "object" && "text" in output) {
      return output.text as string;
    }
    throw new Error("Unexpected format received from Replicate transcription API.");
  } catch (error) {
    console.error("Replicate transcription error:", error);
    throw new Error("Failed to transcribe audio using both OpenAI and Replicate.");
  }
}
