"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../apis/prisma";

export async function getAverageScore() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

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
          createdAt: { gte: lastWeekStart, lt: currentWeekStart },
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
