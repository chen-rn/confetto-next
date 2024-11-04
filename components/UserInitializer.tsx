import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function UserInitializer() {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      // New user - create their record
      await prisma.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log(`Created new user: ${userId}`);
    } else if (dbUser.email !== email) {
      // Existing user with updated email - update their record
      await prisma.user.update({
        where: { id: userId },
        data: { email },
      });
      console.log(`Updated email for user: ${userId}`);
    }
  } catch (error) {
    console.error("Error in UserInitializer:", error);
  }
  return null;
}
