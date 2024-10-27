"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { School } from "@prisma/client";
import { OnboardingStatus } from "@prisma/client";

interface OnboardingData {
  mmiDate?: Date | null;
  schools?: School[];
  primaryConcern?: string | null;
  onboardingStatus?: OnboardingStatus;
}

export async function updateOnboarding(data: OnboardingData) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      mmiDate: data.mmiDate,
      schools: {
        set: data.schools,
      },
      primaryConcern: data.primaryConcern,
      onboardingStatus: data.onboardingStatus,
    },
  });
}
