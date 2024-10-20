import { prisma } from "@/lib/apis/prisma";
import { auth } from "@clerk/nextjs/server";

export async function UserInitializer() {
  const { userId } = auth();

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      await prisma.user.create({ data: { id: userId } });
    }
  }
  return null;
}
