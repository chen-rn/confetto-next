import { SchoolPreferences } from "./SchoolPreferences";
import { SubscriptionSettings } from "./SubscriptionSettings";
import { UserProfile } from "./UserProfile";
import { InterviewPreferences } from "./InterviewPreferences";
import { NotificationSettings } from "./NotificationSettings";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SignOutContainer } from "./SignOutContainer";

export async function SettingsContent() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      stripePriceId: true,
      currentPeriodEnd: true,
      mmiDate: true,
      primaryConcern: true,
      onboardingStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfile />
        <InterviewPreferences mmiDate={user.mmiDate} primaryConcern={user.primaryConcern} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SchoolPreferences />
        <NotificationSettings />
      </div>

      <SubscriptionSettings />

      <SignOutContainer />
    </div>
  );
}
