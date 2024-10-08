"use server";

import { prisma } from "@/lib/apis/prisma";

export async function saveVideoAndAudioReference(
  mockId: string,
  videoUrl: string,
  audioUrl: string
): Promise<void> {
  try {
    await prisma.mockInterview.update({
      where: { id: mockId },
      data: {
        videoUrl, // Ensure this field exists in your Prisma schema
        recordingUrl: audioUrl, // Ensure this field exists in your Prisma schema
      },
    });
  } catch (error) {
    console.error("Error updating MockInterview:", error);
    throw new Error("Failed to update MockInterview with video and audio URLs");
  }
}
