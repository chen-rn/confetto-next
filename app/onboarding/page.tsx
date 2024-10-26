import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { prisma } from "@/lib/apis/prisma";

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
    },
  });

  if (user?.onboardingStatus === "COMPLETED") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/30">
      <div className="w-full max-w-2xl px-4">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <OnboardingFlow initialData={user} />
        </div>
      </div>
    </div>
  );
}
