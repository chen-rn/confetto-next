export const ROUTES = {
  HOME: "/",
  CREATE_MOCK: "/create-mock",
  MOCK_HISTORY: "/practice-history",
  SIGN_IN: "/sign-in",
  MOCK_RESULT: (id: string) => `/mock/${id}/result`,
  MOCK: (id: string) => `/mock/${id}`,
} as const;
