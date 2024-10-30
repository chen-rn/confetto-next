"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserSubscription() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      stripeCustomerId: true,
      currentPeriodEnd: true,
      trialStartedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
