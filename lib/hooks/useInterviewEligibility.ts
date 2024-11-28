import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/actions/user";
import { getInterviewCount } from "@/lib/actions/mock-interviews";

export const MAX_TRIAL_CREDITS = 3;

export function useInterviewEligibility() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: true, // Force refetch when component mounts
  });

  const { data: interviewCount = 0 } = useQuery({
    queryKey: ["interviewCount"],
    queryFn: () => getInterviewCount(),
  });

  if (!user) {
    return {
      isEligible: false,
      user: null,
      hasTrialStarted: false,
      remainingCredits: 0,
      subscriptionActive: false,
    };
  }

  const subscriptionActive = user.subscriptionStatus === "ACTIVE";
  const isInTrial = user.subscriptionStatus === "TRIAL";

  const isEligible = subscriptionActive || (isInTrial && interviewCount < MAX_TRIAL_CREDITS);

  const remainingCredits = isInTrial
    ? Math.max(0, MAX_TRIAL_CREDITS - interviewCount)
    : subscriptionActive
    ? Number.POSITIVE_INFINITY
    : 0;

  const hasTrialStarted = user.trialStartedAt !== null;

  return {
    isEligible,
    user,
    hasTrialStarted,
    remainingCredits,
    subscriptionActive,
  };
}
