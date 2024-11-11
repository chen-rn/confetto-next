import { z } from "zod";

export function validateAIResponse<T>({
  schema,
  content,
  fallback,
}: {
  schema: z.ZodSchema<T>;
  content: string | null | undefined;
  fallback: T;
}): T {
  if (!content) {
    console.error("Empty AI response");
    return fallback;
  }

  try {
    // Try to extract JSON if the response contains extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;

    const parsed = JSON.parse(jsonContent);
    const validated = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("AI response validation failed:", error);
    console.error("Raw content:", content);
    return fallback;
  }
}
