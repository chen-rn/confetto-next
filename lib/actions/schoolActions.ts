"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { School } from "@prisma/client";

export async function addSchool(schoolId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      schools: {
        connect: { id: schoolId },
      },
    },
  });
}

export async function removeSchool(schoolId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: {
      schools: {
        disconnect: { id: schoolId },
      },
    },
  });
}

export async function getAllSchools(): Promise<School[]> {
  const schools = await prisma.school.findMany();

  return schools;
}

export async function getUserSchools(): Promise<School[]> {
  const { userId } = auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      schools: true,
    },
  });

  return user?.schools || [];
}
