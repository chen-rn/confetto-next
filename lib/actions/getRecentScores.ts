"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../apis/prisma";

export async function getRecentScores() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const recentInterviews = await prisma.mockInterview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { feedback: true },
  });

  return recentInterviews
    .map((interview) => ({
      date: interview.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: interview.feedback?.overallScore || 0,
    }))
    .reverse();
}
