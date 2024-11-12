import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function UserInitializer() {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser && email) {
      dbUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log(`Created new user: ${userId}`);
    } else if (dbUser.id !== userId || dbUser.email !== email) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { id: userId, email },
      });
      console.log(`Updated user: ${userId}`);
    }
  } catch (error) {
    console.error("Error in UserInitializer:", error);
  }
  return null;
}
