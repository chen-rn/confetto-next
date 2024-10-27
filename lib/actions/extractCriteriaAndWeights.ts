import { openrouter } from "../openrouter";

export async function extractCriteriaAndWeights(analysis: string): Promise<string> {
  const prompt = `
Extract the criteria and weights from the following analysis. Return a list of criteria and their weights in a clear, readable format, including both "How You Say It" and "What You Say" sections:

${analysis}

Please format the output as follows:

How You Say It:
1. [Criterion Name]: [Weight]
2. [Criterion Name]: [Weight]
3. [Criterion Name]: [Weight]

What You Say:
1. [Criterion Name]: [Weight]
2. [Criterion Name]: [Weight]
3. [Criterion Name]: [Weight]

Total: 100
`;

  try {
    const response = await openrouter.chat.completions.create({
      model: "google/gemini-flash-1.5-8b",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in the response");
    }

    return content.trim();
  } catch (error) {
    console.error("Error extracting criteria and weights:", error);
    throw new Error("Failed to extract criteria and weights");
  }
}
