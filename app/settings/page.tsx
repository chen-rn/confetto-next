import { SchoolPreferences } from "@/app/settings/SchoolPreferences";
import { SubscriptionSettings } from "@/app/settings/SubscriptionSettings";
import { UserProfile } from "@/app/settings/UserProfile";
import { InterviewPreferences } from "@/app/settings/InterviewPreferences";
import { NotificationSettings } from "@/app/settings/NotificationSettings";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

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
    <PageContainer>
      <PageHeader title="Settings" description="Manage your account preferences" />

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

        <div className="flex justify-end">
          <SignOutButton />
        </div>
      </div>
    </PageContainer>
  );
}
