"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import Replicate from "replicate";
import openai from "./openai";

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

    //let's get the quesiton
    const question = await prisma.question.findUnique({
      where: { id: updatedSession.questionId },
    });

    if (!question) {
      throw new Error("Failed to find question");
    }
    // Get feedback using the question and transcription
    const feedback = await getFeedbackFromLLM({
      question: question.content,
      answer: transcription,
    });

    // Create feedback based on the LLM response
    const createdFeedback = await prisma.feedback.create({
      data: {
        content: feedback || "null",
        practiceSessionId: sessionId,
      },
    });

    if (!createdFeedback) {
      throw new Error("Failed to create feedback");
    }

    revalidatePath(`/session/${sessionId}`);
    return {
      success: true,
      message: "Audio URL saved, transcribed, and feedback generated successfully",
    };
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

async function getFeedbackFromLLM({ question, answer }: { question: string; answer: string }) {
  const prompt = `The following is a medical school interview practice session.

Please grade the answer out of 100 where the grading is broken down into 5 categories with the following weights:

1. Understanding of ethical principles (weight of 25)
2. Communication skills (weight of 20)
3. Professionalism and empathy (weight of 20)
4. Legal and medical legislation within the jurisdiction of Canada (weight of 15)
5. Organization and structure (weight of 20)

Additionally, please provide feedback, along with actionable insights.

The question is the following:

${question}

The answer is the following:

${answer}`;

  console.log("logging prompt", prompt);

  // TODO: Implement the actual call to the LLM API here
  // This function should return the LLM's response
  const response = await openai.chat.completions.create({
    model: "o1-preview",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}
