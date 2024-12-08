"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function getTotalInterviews() {
  const userId = auth().userId;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const total = await prisma.mockInterview.count({
    where: {
      userId,
      videoUrl: {
        not: null,
      },
    },
  });

  const thisWeek = await prisma.mockInterview.count({
    where: {
      userId,
      videoUrl: {
        not: null,
      },
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
  });

  return { total, thisWeek };
}
