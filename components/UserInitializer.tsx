"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/actions/user";

export function UserInitializer() {
  const { isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch user profile
  useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getUserProfile(),
    enabled: isSignedIn,
    staleTime: 30000,
  });

  // Invalidate cache when auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    }
  }, [isSignedIn, isLoaded, queryClient]);

  return null;
}
