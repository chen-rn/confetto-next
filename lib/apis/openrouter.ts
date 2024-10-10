import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": process.env.NEXT_PUBLIC_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
  },
});
