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
    <div className="flex h-screen bg-neutral-100">
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
              <p className="text-gray-400 text-sm">Manage your account preferences</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <UserProfile />
              <InterviewPreferences mmiDate={user.mmiDate} primaryConcern={user.primaryConcern} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SchoolPreferences />
              <NotificationSettings />
            </div>

            <SubscriptionSettings
              subscriptionStatus={user.subscriptionStatus}
              stripePriceId={user.stripePriceId}
              currentPeriodEnd={user.currentPeriodEnd}
            />

            <div className="flex justify-end">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
