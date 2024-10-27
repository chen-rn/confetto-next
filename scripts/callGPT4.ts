import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface CallGPT4Options {
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
}

export async function callGPT4({ messages }: CallGPT4Options): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Unexpected null content from OpenAI API");
    }

    return content;
  } catch (error) {
    console.error("Error calling GPT-4:", error);
    throw new Error("Failed to get response from GPT-4");
  }
}

const prompt = `Analyze the following MMI (Multiple Mini Interview) medical school interview question and identify the key evaluation criteria that interviewers would assess during a mock interview. Consider factors such as communication delivery, response structure, professionalism, and empathy. Assign a weight to each criterion so that the total sums up to 100. Limit the criteria to a maximum of four.

Question:
What is the importance of medical research in advancing healthcare, and how might you contribute to this field as a physician?

Please provide a list of evaluation criteria with their corresponding weights out of 100. Format your response as follows:

Criterion 1: X
Criterion 2: Y
Criterion 3: Z
Criterion 4: W
Total: 100

`;

const prompt2 = `The question below is relevant to the MMI interview.
MMI - Multiple Mini Interview, the structure that many medical schools use for interviewing students.
The interesting thing is that these interview questions can be very diverse, and depends greatly depending on the school itself.

We are building an app that lets students do mock MMIs with a real time AI interviewer.
The app works by recording the user's response, transcribing it, and then generating a feedback based on the question, the transcription as well as the criteria for this particular question.
We are currently trying to figure out a set of criteria that we can use for all questions that emcompasses what an MMI look for.

Note, a question does not need to use all the criteria in the evaluation process.
However, we want to figure out about 10 criteria, that, with a combination of them, will allow us to evaluate almost all MMIs.

Note 2: It's likely that a few of these criteria will be used for almost all questions. Ie. Communication/Critical Thinking, Ethical Reasoning, Professionalism, etc.

Give us the criteria that we can use for all questions.
`;

const prompt3 = `
You're an MMI interviewer evaluating a candidate's response during a mock interview session.
How would you break down your evaluation criteria on a high level?
`;

const prompt4 = `
You are an expert MMI (Multiple Mini Interview) evaluator for medical school admissions. Given the following question, select the top 5 most relevant criteria from the list provided below. Assign a weight to each chosen criterion so that the total sums up to 100.

Question: Describe a situation where you had to quickly adapt to an unexpected change. What did you learn from that experience?

List of criteria:
1. Communication Skills
2. Critical Thinking and Problem-Solving
3. Ethical Reasoning and Decision-Making
4. Empathy and Interpersonal Skills
5. Professionalism and Demeanor
6. Self-Awareness and Reflectiveness
7. Organization and Structure of Responses
8. Adaptability and Flexibility
9. Knowledge and Awareness

Please provide your response in the following format:

1. [Criterion Name]: [Weight]
2. [Criterion Name]: [Weight]
3. [Criterion Name]: [Weight]
4. [Criterion Name]: [Weight]
5. [Criterion Name]: [Weight]

Total: 100

Briefly explain why you chose these criteria and their weights for this specific question.
`;

const prompt5 = `
You are an expert MMI (Multiple Mini Interview) evaluator for medical school admissions.

**Task:**

Evaluate a candidate's response to the following question by separating your evaluation criteria into **"How You Say It"** and **"What You Say"**.

---

**Question:**

Say if abortion was banned in BC, how do you think it will impact the number of medical school students in BC?

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

import fs from "node:fs/promises";
import path from "node:path";
import { openai } from "@/lib/openai";
async function saveGPT4Response() {
  try {
    const response = await callGPT4({
      messages: [{ role: "user", content: prompt5 }],
    });

    const filePath = path.join(__dirname, "gpt4Response.txt");

    // Read existing content
    let existingContent = "";
    try {
      existingContent = await fs.readFile(filePath, "utf-8");
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (readError: any) {
      // If file doesn't exist, this is fine, we'll create it
      if (readError.code !== "ENOENT") {
        throw readError;
      }
    }

    // Append new content
    const updatedContent = existingContent ? `${existingContent}\n\n\n\n\n${response}` : response;

    await fs.writeFile(filePath, updatedContent);
    console.log("Response appended to gpt4Response.txt");
  } catch (error) {
    console.error("Error saving response to file:", error);
  }
}

// Call the function if needed
saveGPT4Response();
