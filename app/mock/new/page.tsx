import { redirect } from "next/navigation";
import { Suspense } from "react";
import InterviewOptions from "./InterviewOptions";
import { BackToDashboard } from "./BackToDashboard";
import { InterviewOptionsSkeletons } from "./InterviewOptionsSkeletons";
import { getCurrentUser } from "@/lib/actions/user";
import { getInterviewCount } from "@/lib/actions/mock-interviews";
import { MAX_TRIAL_CREDITS } from "@/lib/hooks/useInterviewEligibility";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default async function NewMockInterviewPage() {
  // Check eligibility server-side
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviewCount = await getInterviewCount();
  const subscriptionActive = user.subscriptionStatus === "ACTIVE";
  const isInTrial = user.subscriptionStatus === "TRIAL";
  const isEligible = subscriptionActive || (isInTrial && interviewCount < MAX_TRIAL_CREDITS);

  if (!isEligible) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-100/50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="bg-yellow-50 rounded-full p-3 w-fit mx-auto">
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Trial Interviews Complete</h1>
          <p className="text-gray-600">
            You've used all {MAX_TRIAL_CREDITS} interviews in your trial. Ready to take your
            interview prep to the next level?
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => redirect("/pricing")}
              className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90"
            >
              Upgrade Now
            </Button>
            <Button variant="outline" onClick={() => redirect("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-100/50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <BackToDashboard />

        {/* Center content vertically */}
        <div className="flex flex-col justify-center min-h-[calc(100vh-200px)] pb-14">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              Start Interview
            </h1>
            <p className="text-gray-600 text-lg">Choose your preferred practice mode to begin</p>
          </div>

          {/* Cards Grid */}
          <div className="max-w-5xl mx-auto w-full">
            <Suspense fallback={<InterviewOptionsSkeletons />}>
              <InterviewOptions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
