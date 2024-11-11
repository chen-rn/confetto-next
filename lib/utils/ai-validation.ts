import { z } from "zod";

export async function validateAIResponse<T>({
  schema,
  content,
  fallback,
}: {
  schema: z.ZodSchema<T>;
  content: string | null;
  fallback: T;
}): Promise<T> {
  if (!content) {
    console.error("Empty response from AI");
    return fallback;
  }

  try {
    const parsed = JSON.parse(content);
    return schema.parse(parsed);
  } catch (error) {
    console.error("AI response validation failed:", error);
    return fallback;
  }
}
