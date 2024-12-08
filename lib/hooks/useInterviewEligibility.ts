import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/actions/user";
import { getInterviewCount } from "@/lib/actions/mock-interviews";

export const MAX_TRIAL_CREDITS = 3;

export function useInterviewEligibility() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 60 * 1000,
  });

  const { data: interviewCount = 0, isLoading: countLoading } = useQuery({
    queryKey: ["interviewCount"],
    queryFn: () => getInterviewCount(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const isLoading = userLoading || (!!user && countLoading);

  const defaultResponse = {
    isEligible: false,
    user: null,
    hasTrialStarted: false,
    remainingCredits: 0,
    subscriptionActive: false,
    isLoading,
    error: null,
  };

  if (isLoading || !user) {
    return defaultResponse;
  }

  const subscriptionActive = user.subscriptionStatus === "ACTIVE";
  const isInTrial = user.subscriptionStatus === "TRIAL";
  const hasTrialStarted = user.trialStartedAt !== null;

  const isEligible = subscriptionActive || (isInTrial && interviewCount < MAX_TRIAL_CREDITS);
  const remainingCredits = isInTrial
    ? Math.max(0, MAX_TRIAL_CREDITS - interviewCount)
    : subscriptionActive
    ? Number.POSITIVE_INFINITY
    : 0;

  return {
    isEligible,
    user,
    hasTrialStarted,
    remainingCredits,
    subscriptionActive,
    isLoading,
    error: null,
  };
}
