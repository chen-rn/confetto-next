"use server";

import { prisma } from "@/lib/prisma";

export async function getMockInterview(mockInterviewId: string) {
  return prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    select: {
      recordingUrl: true,
      videoUrl: true,
      recordingTranscription: true,
      question: {
        select: {
          content: true,
        },
      },
    },
  });
}
