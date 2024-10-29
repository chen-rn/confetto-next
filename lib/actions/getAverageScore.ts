"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function getAverageScore() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get current date
  const now = new Date();

  // Calculate start of current week (Sunday)
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  // Calculate start of last week
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);

  // Calculate end of last week (end of Saturday)
  const lastWeekEnd = new Date(currentWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const [currentWeekAvg, lastWeekAvg] = await Promise.all([
    prisma.feedback.aggregate({
      where: {
        mockInterview: {
          userId,
          createdAt: { gte: currentWeekStart },
        },
      },
      _avg: { overallScore: true },
    }),
    prisma.feedback.aggregate({
      where: {
        mockInterview: {
          userId,
          createdAt: {
            gte: lastWeekStart,
            lt: currentWeekStart,
          },
        },
      },
      _avg: { overallScore: true },
    }),
  ]);

  const currentAvg = currentWeekAvg._avg.overallScore || 0;
  const lastAvg = lastWeekAvg._avg.overallScore || 0;
  const difference = currentAvg - lastAvg;

  return {
    average: currentAvg.toFixed(1),
    difference: difference.toFixed(1),
  };
}
