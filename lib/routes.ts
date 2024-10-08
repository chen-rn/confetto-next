export const ROUTES = {
  HOME: "/",
  CREATE_MOCK: "/create-mock",
  MOCK_HISTORY: "/mock-history",
  MOCK: (mockId: string) => `/mock/${mockId}`,
  MOCK_RESULT: (mockId: string) => `/mock/${mockId}/result`,
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
};
