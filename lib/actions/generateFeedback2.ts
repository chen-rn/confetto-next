"use server";

import type { Feedback } from "@prisma/client";
import { openai } from "../apis/openai";
import { openrouter } from "../apis/openrouter";
import { prisma } from "../apis/prisma";

interface GenerateFeedbackParams {
  question: string;
  answer: string;
  mockInterviewId: string;
}
const categories = [
  {
    name: "Communication Skills",
    description: `Verbal Communication:
- Clarity and Coherence: Ability to articulate thoughts in a clear, logical, and organized manner.
- Language Proficiency: Use of appropriate vocabulary and grammar.
- Persuasiveness: Capability to convince others through reasoned arguments.

Non-Verbal Communication:
- Body Language: Appropriate eye contact, gestures, and posture.
- Active Listening: Demonstrating attentiveness and understanding through nods and responsive expressions.

Why It Matters:
Effective communication is vital in patient interactions, teamwork, and professional collaborations. Assessors look for candidates who can convey complex information understandably and empathetically.`,
  },
  {
    name: "Ethical Reasoning",
    description: `Understanding Ethical Principles:
- Autonomy, Beneficence, Non-maleficence, and Justice: Familiarity with core medical ethics concepts.

Application in Scenarios:
- Analyzing Ethical Dilemmas: Ability to identify ethical issues in a given situation.
- Balancing Conflicting Values: Skill in weighing different ethical considerations to reach a reasoned conclusion.

Why It Matters:
Physicians often face ethical challenges. Demonstrating sound ethical reasoning shows preparedness to handle such situations responsibly.`,
  },
  {
    name: "Empathy and Compassion",
    description: `Emotional Intelligence:
- Perspective-Taking: Ability to understand and consider others' feelings and viewpoints.
- Emotional Responsiveness: Showing genuine concern and compassion.

Why It Matters:
Empathy enhances patient care and builds trust. Assessors evaluate your capacity to connect emotionally with others.`,
  },
  {
    name: "Critical Thinking and Problem-Solving",
    description: `Analytical Skills:
- Information Gathering: Asking pertinent questions to fully understand a problem.
- Logical Reasoning: Drawing conclusions based on evidence and sound reasoning.

Creativity:
- Innovative Solutions: Offering unique and effective approaches to problems.

Why It Matters:
Medical professionals must diagnose issues and develop treatment plans efficiently. Demonstrating these skills indicates your readiness for clinical problem-solving.`,
  },
  {
    name: "Teamwork and Collaboration",
    description: `Interpersonal Skills:
- Cooperation: Willingness to work with others towards a common goal.
- Conflict Resolution: Ability to navigate and resolve disagreements constructively.

Leadership Qualities:
- Guidance: Leading discussions or groups when appropriate.
- Supportiveness: Encouraging and assisting team members.

Why It Matters:
Healthcare is collaborative. Showing you can work effectively in a team is essential.`,
  },
  {
    name: "Professionalism",
    description: `Ethical Conduct:
- Integrity: Honesty in your responses and acknowledgment of limitations.
- Accountability: Taking responsibility for your actions.

Respectfulness:
- Cultural Sensitivity: Awareness and respect for diversity and different perspectives.
- Appropriate Demeanor: Maintaining professionalism under pressure.

Why It Matters:
Professionalism is foundational in medicine. Assessors look for candidates who embody these values consistently.`,
  },
  {
    name: "Self-Awareness and Reflectiveness",
    description: `Insight:
- Strengths and Weaknesses: Ability to recognize and articulate your own competencies and areas for growth.
- Feedback Reception: Openness to constructive criticism and willingness to improve.

Adaptability:
- Flexibility: Adjusting your approach based on new information or feedback.

Why It Matters:
Self-aware individuals are more likely to engage in lifelong learning and professional development.`,
  },
  {
    name: "Motivation and Commitment to Medicine",
    description: `Passion for the Field:
- Genuine Interest: Demonstrating a sincere desire to pursue a career in medicine.
- Understanding of the Profession: Awareness of the rewards and challenges in healthcare.

Dedication:
- Long-Term Goals: Clear articulation of your aspirations and how you plan to achieve them.
- Resilience: Evidence of perseverance in the face of obstacles.

Why It Matters:
Medical schools seek candidates committed to the demanding nature of the profession.`,
  },
  {
    name: "Cultural Competence and Social Responsibility",
    description: `Diversity Awareness:
- Inclusivity: Respecting and valuing different backgrounds and experiences.
- Bias Recognition: Acknowledging and addressing personal biases.

Community Engagement:
- Volunteerism: Involvement in community service or social initiatives.
- Advocacy: Commitment to social justice and improving public health.

Why It Matters:
Culturally competent physicians provide better care in diverse societies. Assessors value a global and socially conscious perspective.`,
  },
  {
    name: "Resilience and Stress Management",
    description: `Emotional Stability:
- Composure: Maintaining calm under pressure.
- Stress Coping Mechanisms: Utilizing healthy strategies to manage stress.

Problem-Facing Attitude:
- Optimism: Approaching challenges with a positive outlook.
- Resourcefulness: Finding ways to overcome difficulties.

Why It Matters:
The medical field is inherently stressful. Demonstrating resilience indicates your ability to thrive in such environments.`,
  },
  {
    name: "Knowledge of Health Care Systems",
    description: `Health Policy Awareness:
- Current Issues: Familiarity with contemporary challenges in healthcare.
- System Navigation: Understanding how different components of the healthcare system interact.

Why It Matters:
Awareness of the broader healthcare context enhances your ability to function effectively within it.`,
  },
];

export async function generateFeedback2({
  question,
  answer,
  mockInterviewId,
}: GenerateFeedbackParams): Promise<Feedback> {
  const categoryFeedbacks = await Promise.all(
    categories.map(async (category) => {
      const prompt = `
      You're an MMI interviewer evaluating a candidate's response during a mock interview session.
        
        Question: ${question}
        Answer: ${answer}
        Category: ${category.name}
        ${category.description}

        Please evaluate the answer based on the given category.
        Provide a score out of 100 and detailed feedback.

        Ensure your response is in the following format!
        <feedback>Detailed feedback here</feedback>
        <score>X</score>
      `;

      const response = await openai.chat.completions.create({
        model: "o1-preview",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content || "";
      const scoreMatch = content.match(/<score>(\d+)<\/score>/);
      const feedbackMatch = content.match(/<feedback>([\s\S]*?)<\/feedback>/);
      return {
        name: category.name,
        score: scoreMatch ? Number.parseInt(scoreMatch[1], 10) : 0,
        feedback: feedbackMatch ? feedbackMatch[1].trim() : "",
      };
    })
  );

  const totalScore = categoryFeedbacks.reduce((sum, cf) => sum + cf.score, 0);
  const averageScore = Math.round(totalScore / categories.length);

  const categoryPreview = categoryFeedbacks.map((cf) => `${cf.name}: ${cf.score}/100`).join("\n\n");

  const combinedFeedback = `# Overall Feedback

**Average Score: ${averageScore}/100**

## Category Scores Preview
${categoryPreview}

## Detailed Feedback

${categoryFeedbacks
  .map((cf) => `### ${cf.name}\n\n**Score: ${cf.score}/100**\n\n${cf.feedback}`)
  .join("\n\n")}`;

  const feedback = await prisma.feedback.create({
    data: {
      overallFeedback: combinedFeedback,
      overallScore: averageScore,
      mockInterviewId,
    },
  });

  return feedback;
}
