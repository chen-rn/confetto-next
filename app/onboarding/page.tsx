import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/app/onboarding/OnboardingFlow";
import { prisma } from "@/lib/prisma";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function OnboardingPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingStatus: true,
      schools: true,
      mmiDate: true,
      primaryConcern: true,
      subscriptionStatus: true,
    },
  });

  if (user?.onboardingStatus === "COMPLETED") {
    if (user.subscriptionStatus === "NOT_SUBSCRIBED" || user.subscriptionStatus === "TRIAL") {
      redirect("/welcome");
    }
    redirect("/");
  }

  return (
    <ScrollArea className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <OnboardingFlow initialData={user} />
    </ScrollArea>
  );
}
