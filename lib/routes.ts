export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  QUESTION_BANK: "/question-bank",
  MOCK_HISTORY: "/practice-history",
  SETTINGS: "/settings",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  MOCK_NEW: "/mock/new",
  START_INTERVIEW: "/start-interview",
  MOCK: (id: string) => `/mock/${id}`,
  MOCK_RESULT: (id: string) => `/mock/${id}/result`,
  PRICING: "/pricing",
  ONBOARDING: "/onboarding",
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
  return (SIDEBAR_ROUTES as readonly string[]).includes(pathname);
}
