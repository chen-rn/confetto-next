"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SubscriptionStatus } from "@prisma/client";
import { addDays } from "date-fns";

export interface UserSubscription {
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  trialStartedAt: Date | null;
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  const { userId } = auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
      trialStartedAt: true,
    },
  });

  if (!user) return null;

  return {
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    trialStartedAt: user.trialStartedAt,
  };
}

export async function startTrial() {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  if (user?.subscriptionStatus !== "NOT_SUBSCRIBED") {
    throw new Error("User already has an active subscription or trial");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "TRIAL" as SubscriptionStatus,
      trialStartedAt: new Date(),
      currentPeriodEnd: addDays(new Date(), 7), // 7-day trial
    },
  });
}
