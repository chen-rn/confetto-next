import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Server Component that syncs Clerk auth user with our database
 * Runs on every request to ensure DB consistency with Clerk
 *
 * Flow:
 * 1. Check if user exists in DB by Clerk userId
 * 2. If not found, check by email as fallback
 * 3. Create new user if doesn't exist
 * 4. Update user if IDs/emails don't match
 */
export async function UserInitializer() {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    // Try finding user by Clerk ID first
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Fallback: Try finding by email (handles cases where user might exist with different ID)
    if (!dbUser && email) {
      dbUser = await prisma.user.findUnique({
        where: { email },
      });
    }

    // Create new user if doesn't exist
    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email,
        },
      });
      console.log(`Created new user: ${userId}`);
      redirect("/onboarding");
    }
    // Update if IDs or emails don't match (handles user migration cases)
    else if (dbUser.id !== userId || dbUser.email !== email) {
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
