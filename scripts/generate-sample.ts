import { openrouter } from "../lib/openrouter";

const CRITERIA_PROMPT = `As an MMI expert, create detailed evaluation criteria for the following medical ethics question. 
Break down the key components that should be assessed, with specific scoring weights (total should be 100).

Question: {question}

Format the response as:
Component 1 (X points):
- What to look for
- Key elements to assess
- Red flags

Component 2 (Y points):
...etc.

Focus on:
1. Ethical reasoning
2. Knowledge of medical/public health principles
3. Communication clarity
4. Balanced perspective
5. Practical application`;

const SAMPLE_ANSWER_PROMPT = `You are a top-performing medical school candidate in an MMI interview. 
Provide a well-structured, thoughtful response to this question that demonstrates:
- Clear ethical reasoning
- Understanding of public health principles
- Balanced consideration of individual rights vs community welfare
- Practical solutions
- Professional communication style

Question: {question}

Structure your response as a natural spoken answer, as if you're speaking in an interview. 
Include appropriate pauses and transitions. Aim for a 5-7 minute response.`;

export async function generateSampleContent(question: string) {
  try {
    // Generate criteria using Claude
    const criteriaResponse = await openrouter.chat.completions.create({
      model: "anthropic/claude-3-sonnet:beta",
      messages: [
        {
          role: "user",
          content: CRITERIA_PROMPT.replace("{question}", question),
        },
      ],
    });

    // Generate sample answer
    const answerResponse = await openrouter.chat.completions.create({
      model: "anthropic/claude-3-sonnet:beta",
      messages: [
        {
          role: "user",
          content: SAMPLE_ANSWER_PROMPT.replace("{question}", question),
        },
      ],
    });

    return {
      criteria: criteriaResponse.choices[0].message.content,
      sampleAnswer: answerResponse.choices[0].message.content || "",
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

// Only run the example if this is the main module
if (require.main === module) {
  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  const question = `How would you balance individual patient rights with community health responsibilities in Rhode Island, such as during a public health emergency like a flu outbreak?`;

  generateSampleContent(question)
    .then(({ criteria, sampleAnswer }) => {
      console.log("\n=== EVALUATION CRITERIA ===\n");
      console.log(criteria);
      console.log("\n=== SAMPLE ANSWER ===\n");
      console.log(sampleAnswer);
    })
    .catch((error) => {
      console.error("Script failed:", error);
    });
}
