"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/actions/user";

export function AuthRedirect() {
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => {
      return getUserProfile();
    },
  });

  useEffect(() => {
    // Only redirect to onboarding if the status is NOT_STARTED or IN_PROGRESS
    if (
      userProfile &&
      (userProfile.onboardingStatus === "NOT_STARTED" ||
        userProfile.onboardingStatus === "IN_PROGRESS")
    ) {
      router.push("/onboarding");
    }
  }, [userProfile, router]);

  return null;
}
