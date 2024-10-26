export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  QUESTION_BANK: "/question-bank",
  MOCK_HISTORY: "/practice-history",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PRICING: "/pricing",
  ONBOARDING: "/onboarding",
  LIVEKIT_TEST: "/livekit-test",
  MOCK_RESULT: (id: string) => `/mock/${id}/result`,
  MOCK: (id: string) => `/mock/${id}`,
  SETTINGS: "/settings",
  CREATE_MOCK: "/create-mock", // Added this since it's used in the dashboard
} as const;

// Routes that don't require authentication and shouldn't show the sidebar
export const PUBLIC_ROUTES = [ROUTES.SIGN_IN, ROUTES.SIGN_UP, ROUTES.PRICING] as const;

// Routes that require authentication but shouldn't show the sidebar
export const NO_SIDEBAR_ROUTES = [ROUTES.ONBOARDING, ...PUBLIC_ROUTES] as const;
