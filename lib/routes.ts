export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  QUESTION_BANK: "/question-bank",
  MOCK_HISTORY: "/practice-history",
  SETTINGS: "/settings",

  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PRICING: "/pricing",
  ONBOARDING: "/onboarding",
  LIVEKIT_TEST: "/livekit-test",
  MOCK_RESULT: (id: string) => `/mock/${id}/result`,
  MOCK: (id: string) => `/mock/${id}`,
} as const;

// Routes that should show the sidebar
export const SIDEBAR_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.QUESTION_BANK,
  ROUTES.MOCK_HISTORY,
  ROUTES.SETTINGS,
] as const;

// Helper function to check if a route should show the sidebar
export function shouldShowSidebar(pathname: string): boolean {
  return SIDEBAR_ROUTES.includes(pathname as any);
}
