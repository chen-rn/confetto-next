import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/actions/user";
import { getInterviewCount } from "@/lib/actions/mock-interviews";

export const MAX_TRIAL_CREDITS = 3;

export function useInterviewEligibility() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: true, // Force refetch when component mounts
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  const { data: interviewCount = 0, isLoading: countLoading } = useQuery({
    queryKey: ["interviewCount"],
    queryFn: () => getInterviewCount(),
    enabled: !!user, // Only fetch if user exists
  });

  // Return early if there's an error
  if (userError) {
    return {
      isEligible: false,
      user: null,
      hasTrialStarted: false,
      remainingCredits: 0,
      subscriptionActive: false,
      isLoading: false,
      error: userError,
    };
  }

  // Return loading state
  if (userLoading || countLoading) {
    return {
      isEligible: false,
      user: null,
      hasTrialStarted: false,
      remainingCredits: 0,
      subscriptionActive: false,
      isLoading: true,
      error: null,
    };
  }

  if (!user) {
    return {
      isEligible: false,
      user: null,
      hasTrialStarted: false,
      remainingCredits: 0,
      subscriptionActive: false,
      isLoading: false,
      error: null,
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
    isLoading: false,
    error: null,
  };
}
