"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/actions/user";
import { useAuth } from "@clerk/nextjs";

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const { data: userProfile, isSuccess } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
    enabled: isSignedIn,
    staleTime: 30000,
    retry: 3,
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Don't redirect if already on onboarding
    if (pathname === "/onboarding") return;

    // Only redirect once we've successfully fetched the profile
    if (
      isSuccess &&
      userProfile &&
      (userProfile.onboardingStatus === "NOT_STARTED" ||
        userProfile.onboardingStatus === "IN_PROGRESS")
    ) {
      router.push("/onboarding");
    }
  }, [userProfile, isSuccess, router, isSignedIn, isLoaded, pathname]);

  return null;
}
