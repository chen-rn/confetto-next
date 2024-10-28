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

  if (interviews.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(interviews[0].createdAt);

  // Check if the most recent interview was today or yesterday
  const now = new Date();
  const daysSinceLastInterview = Math.floor(
    (now.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If the last interview was more than 1 day ago, streak is broken
  if (daysSinceLastInterview > 1) return 0;

  // Calculate streak by checking consecutive days
  for (let i = 1; i < interviews.length; i++) {
    const prevDate = new Date(interviews[i].createdAt);

    // Calculate days difference between consecutive interviews
    const daysDifference = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If exactly 1 day difference, continue streak
    if (daysDifference === 1) {
      streak++;
      currentDate = prevDate;
    } else if (daysDifference === 0) {
      // Same day interview, don't increment streak but update current date
      currentDate = prevDate;
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
}
