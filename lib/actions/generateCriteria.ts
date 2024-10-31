"use server";

import { openai } from "../openai";
import { extractCriteriaAndWeights } from "./extractCriteriaAndWeights";

const PROMPT_1 = `
You are an expert MMI (Multiple Mini Interview) evaluator for medical school admissions.

**Task:**

Evaluate a candidate's response to the following question by separating your evaluation criteria into **"How You Say It"** and **"What You Say"**.

---

**Question:**

{questionContent}

---

**Evaluation Criteria:**

**How You Say It** (consistent for all questions):
1. Communication Skills
2. Professionalism and Demeanor
3. Empathy and Emotional Intelligence

**What You Say** (select the most relevant for each question):
1. Critical Thinking and Problem-Solving
2. Ethical Reasoning, Integrity, and Honesty
3. Awareness of Healthcare Issues
4. Adaptability, Resilience, and Coping Skills
5. Self-Awareness and Reflectiveness
6. Inclusivity and Cultural Sensitivity
7. Teamwork and Collaboration
8. Commitment and Motivation for Medicine
9. Time Management and Organizational Skills
10. Leadership and Initiative
11. Patient-Centeredness

---

**Instructions:**

- **Select** the most relevant criteria from **"What You Say"** for this question.
- **Assign a weight** to each criterion so that the total sums up to **100**.
- Provide your response in the following format:

**How You Say It**
1. [Criterion Name]: [Weight]
2. [Criterion Name]: [Weight]
3. [Criterion Name]: [Weight]

**What You Say**
1. [Criterion Name]: [Weight]
2. [Criterion Name]: [Weight]
3. [Criterion Name]: [Weight]

**Total: 100**

- **Briefly explain** why you chose these criteria and assigned these weights.
`;

const PROMPT_2 = `
You are an expert MMI (Multiple Mini Interview) evaluator for medical school admissions.

**Task:**
Create evaluation criteria for the following MMI question. First, identify the type of MMI question (ethical dilemma, roleplay, situational, personal insight, etc).

**Question:**
{questionContent}

**Evaluation Structure:**

Based on the question type:

For Ethical Dilemmas:
- Problem Analysis (identifying ethical principles, stakeholders)
- Reasoning Process (weighing options, considering consequences)
- Resolution Approach (balanced decision-making, implementation)

For Roleplay Scenarios:
- Initial Approach (establishing rapport, understanding situation)
- Communication Style (active listening, empathy)
- Problem Resolution (collaborative solutions, follow-through)

For Situational Questions:
- Situation Assessment (problem identification, context understanding)
- Decision Making (prioritization, reasoning)
- Action Planning (concrete steps, contingencies)

For Personal Insight:
- Self-Awareness (reflection, insight)
- Growth Mindset (learning from experiences)
- Professional Identity (alignment with medical values)

**Instructions:**
1. Identify question type
2. Select relevant categories based on type
3. Assign weights to each criterion (total 100)
4. Briefly explain rationale for weights

Maintain consistent scoring for common elements across all types:
- Communication Clarity (10%)
- Professional Demeanor (10%)
- Overall Structure (10%)
`;

const PROMPT_3 = `
You are an expert MMI evaluator for medical school admissions.

**Task:**
For this MMI question, identify the 3-4 MOST important criteria that would distinguish an excellent verbal response. Remember this is a spoken interview response, not a written one.

**Question:**
{questionContent}

**Instructions:**
1. First, analyze what this question is truly testing at its core
2. Identify the most crucial elements for evaluation (both verbal delivery and content)
3. Assign weights to each criterion, totaling 100%
4. Briefly explain your reasoning for these choices

Your criteria should reflect both HOW the candidate communicates and WHAT they say, but you decide the balance based on what's most important for this specific question.
`;

export async function generateCriteria(
  questionContent: string,
  promptVersion: "v1" | "v2" | "v3" = "v3"
): Promise<string> {
  try {
    console.log("Starting question analysis process...");

    // Select prompt based on version
    const selectedPrompt =
      promptVersion === "v1" ? PROMPT_1 : promptVersion === "v2" ? PROMPT_2 : PROMPT_3;
    const prompt = selectedPrompt.replace("{questionContent}", questionContent);

    // Get analysis from OpenAI
    console.log(`Requesting analysis from OpenAI using prompt ${promptVersion}...`);
    const openaiResponse = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: prompt }],
    });
    console.log("OpenAI response received.");

    const analysis = openaiResponse.choices[0].message.content;
    if (!analysis) {
      console.error("Error: Unexpected null content from OpenAI API");
      throw new Error("Unexpected null content from OpenAI API");
    }
    console.log("Generated analysis:", analysis);

    return analysis;
  } catch (error) {
    console.error("LLM question analysis error:", error);
    throw new Error("Failed to analyze the question.");
  }
}
