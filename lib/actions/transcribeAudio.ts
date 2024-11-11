"use server";

import { AssemblyAI } from "assemblyai";
import { replicate } from "../replicate";

const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_KEY || "",
});

/**
 * Transcribes audio using OpenAI's Whisper model, with Replicate as a backup.
 *
 * @param audioUrl - URL of the audio file to transcribe.
 * @returns Transcribed text.
 */
export async function transcribeAudio(audioUrl: string): Promise<string> {
  // Try AssemblyAI first
  try {
    console.log("Attempting AssemblyAI transcription...");
    const transcript = await assemblyClient.transcripts.transcribe({
      audio_url: audioUrl,
    });

    if (!transcript.text) {
      throw new Error("No transcription text received from AssemblyAI");
    }

    console.log("AssemblyAI transcription successful", transcript.text);
    return transcript.text;
  } catch (error) {
    console.error("AssemblyAI transcription error:", error);
    return fallbackToOpenAI(audioUrl);
  }
}

async function fallbackToOpenAI(audioUrl: string): Promise<string> {
  try {
    console.log("Falling back to OpenAI transcription...");
    const response = await fetch(audioUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

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
    console.log("Falling back to Replicate transcription...");
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
    throw new Error("Failed to transcribe audio using all available services.");
  }
}
