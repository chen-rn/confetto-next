"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";
import { revalidatePath } from "next/cache";
import type { School } from "@prisma/client";

interface OnboardingData {
  mmiDate: Date | null;
  schools: School[]; // Changed from Pick<School, "id">[]
  primaryConcern: string | null;
}

export async function updateOnboarding(data: OnboardingData) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      mmiDate: data.mmiDate,
      schools: {
        set: data.schools.map((school) => ({ id: school.id })),
      },
      primaryConcern: data.primaryConcern,
      onboardingStatus: "COMPLETED",
      onboardingCompletedAt: new Date(),
    },
  });

  revalidatePath("/onboarding");
  return user;
}
