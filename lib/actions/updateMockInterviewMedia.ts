"use server";

import { prisma } from "../prisma";

export async function updateMockInterviewMedia(
  mockId: string,
  videoUrl: string,
  audioUrl: string,
  transcription?: string
) {
  return prisma.mockInterview.update({
    where: { id: mockId },
    data: {
      videoUrl,
      recordingUrl: audioUrl,
      recordingTranscription: transcription,
    },
  });
}
