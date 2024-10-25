"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";

export async function addSchool(schoolId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      schools: {
        connect: { id: schoolId },
      },
    },
  });
}

export async function removeSchool(schoolId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      schools: {
        disconnect: { id: schoolId },
      },
    },
  });
}

export async function getAllSchools() {
  const schools = await prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      state: true,
      country: true,
    },
  });

  return schools;
}

export async function getUserSchools() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      schools: {
        select: {
          id: true,
          name: true,
          state: true,
          country: true,
        },
      },
    },
  });

  return user?.schools || [];
}
