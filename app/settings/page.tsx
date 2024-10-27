import { SchoolPreferences } from "@/app/settings/SchoolPreferences";
import { SubscriptionSettings } from "@/app/settings/SubscriptionSettings";
import { UserProfile } from "@/app/settings/UserProfile";
import { InterviewPreferences } from "@/app/settings/InterviewPreferences";
import { NotificationSettings } from "@/app/settings/NotificationSettings";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function SettingsPage() {
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
    <div className="container max-w-4xl mx-auto py-6 px-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <UserProfile />
        <InterviewPreferences mmiDate={user.mmiDate} primaryConcern={user.primaryConcern} />
        <SchoolPreferences />
        <NotificationSettings />
        <SubscriptionSettings
          subscriptionStatus={user.subscriptionStatus}
          stripePriceId={user.stripePriceId}
          currentPeriodEnd={user.currentPeriodEnd}
        />
        <div className="pt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
