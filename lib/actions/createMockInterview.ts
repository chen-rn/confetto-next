"use server";

import { prisma } from "../prisma";

/**
 * Creates a new practice mock for the user.
 *
 * @param questionId - The ID of the question for the mock interview.
 * @param userId - The ID of the user creating the mock interview.
 * @returns The ID of the created mock interview.
 */
export async function createMockInterview(questionId: string, userId: string): Promise<string> {
  if (!questionId || !userId) {
    throw new Error("Invalid question ID or user ID");
  }

  try {
    const mockInterview = await prisma.mockInterview.create({
      data: {
        userId,
        questionId,
      },
    });
    return mockInterview.id;
  } catch (error) {
    console.error("Error creating mock interview:", error);
    throw new Error("Failed to create mock interview");
  }
}
