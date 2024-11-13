"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/actions/user";
import { useAuth } from "@clerk/nextjs";

export function AuthRedirect() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
    enabled: isSignedIn,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (
      userProfile &&
      (userProfile.onboardingStatus === "NOT_STARTED" ||
        userProfile.onboardingStatus === "IN_PROGRESS")
    ) {
      router.push("/onboarding");
    }
  }, [userProfile, router, isSignedIn, isLoaded]);

  return null;
}
