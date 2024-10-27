"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function getCurrentStreak() {
  const userId = auth().userId;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const interviews = await prisma.mockInterview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  let streak = 0;
  let currentDate = new Date();

  for (const interview of interviews) {
    const interviewDate = new Date(interview.createdAt);
    if (
      currentDate.toDateString() === interviewDate.toDateString() ||
      currentDate.getDate() - interviewDate.getDate() === 1
    ) {
      streak++;
      currentDate = interviewDate;
    } else {
      break;
    }
  }

  return streak;
}
