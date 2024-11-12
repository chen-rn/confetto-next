"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";

const titleMap: Record<string, string> = {
  [ROUTES.HOME]: "Confetto - AI Powered MMI Interview Prep",
  [ROUTES.QUESTION_BANK]: "Question Bank - Confetto",
  [ROUTES.SETTINGS]: "Settings - Confetto",
  [ROUTES.DASHBOARD]: "Dashboard - Confetto",
  [ROUTES.MOCK_HISTORY]: "Practice History - Confetto",
  [ROUTES.PRICING]: "Pricing - Confetto",
  [ROUTES.ONBOARDING]: "Welcome to Confetto",
  [ROUTES.START_INTERVIEW]: "Start Interview - Confetto",
  [ROUTES.MOCK_NEW]: "New Interview - Confetto",
};

export function MetadataUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    const title = titleMap[pathname] ?? "Confetto";
    document.title = title;
  }, [pathname]);

  return null;
}
