"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface UpdatePreferencesParams {
  mmiDate?: Date;
  primaryConcern?: string;
}

export async function updateUserPreferences({ mmiDate, primaryConcern }: UpdatePreferencesParams) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      mmiDate,
      primaryConcern,
    },
  });
}

export async function getUserProfile() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      onboardingStatus: true,
    },
  });

  return user;
}
