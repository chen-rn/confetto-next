"use server";

import { prisma } from "@/lib/prisma";

export async function seedMockData() {
  // Create a test user first
  const user = await prisma.user.upsert({
    where: { id: "test-user-id" },
    update: {},
    create: {
      id: "test-user-id",
      subscriptionStatus: "NOT_SUBSCRIBED",
      onboardingStatus: "NOT_STARTED",
    },
  });

  // Create a mock question
  const question = await prisma.question.create({
    data: {
      content:
        "Different cultural approaches to teamwork are causing misunderstandings in your department. How would you bridge these differences while building team unity?",
    },
  });

  // Create a mock interview
  const mockInterview = await prisma.mockInterview.create({
    data: {
      userId: user.id,
      questionId: question.id,
      recordingTranscription: `In addressing cultural differences in our team, I believe it's crucial to first understand the various perspectives at play. I've noticed that some team members prefer direct communication while others take a more indirect approach. To bridge these gaps, I would implement several strategies.

First, I would organize team discussions to share cultural perspectives on teamwork. This creates awareness and understanding. Then, I'd establish clear protocols that accommodate different working styles, including multiple feedback channels.

I would also set up a buddy system to foster cross-cultural understanding. Regular check-ins would help us monitor progress and adjust our approach as needed. The goal is to create an environment where all cultural approaches are valued and integrated into our team's workflow.`,
    },
  });

  // Create feedback
  const feedback = await prisma.feedback.create({
    data: {
      mockInterviewId: mockInterview.id,
      overallScore: 85,
      overallFeedback: "Strong response demonstrating cultural awareness and practical solutions.",
      componentScores: {
        create: [
          {
            name: "Cultural Awareness",
            score: 90,
            totalPoints: 100,
            summary: "Excellent understanding of cultural dynamics and their impact on teamwork.",
          },
          {
            name: "Solution Approach",
            score: 85,
            totalPoints: 100,
            summary: "Strong practical solutions with clear implementation steps.",
          },
          {
            name: "Communication",
            score: 88,
            totalPoints: 100,
            summary: "Clear and structured response with good examples.",
          },
        ],
      },

      analysisPoints: {
        create: [
          {
            type: "STRENGTH",
            quote: "I would organize team discussions to share cultural perspectives on teamwork",
            analysis: "Shows proactive approach to building cultural understanding",
          },
          {
            type: "STRENGTH",
            quote: "establish clear protocols that accommodate different working styles",
            analysis: "Demonstrates practical implementation of inclusive practices",
          },
          {
            type: "IMPROVEMENT",
            quote: null,
            analysis: "Could provide more specific examples of past experiences",
          },
        ],
      },

      answerKey: {
        create: {
          modelAnswer: `In my experience working with diverse teams, I've learned that cultural differences in teamwork often manifest in subtle ways that can create unintended tension. Rather than seeing these differences as obstacles, I would approach this situation as an opportunity to strengthen our team through better understanding and adaptation.

First, I would organize informal team discussions where members can share their cultural perspectives on effective teamwork in a safe, judgment-free environment. To bridge these differences, I would establish clear team protocols that incorporate diverse working styles.

The key is to monitor progress and adjust our approach based on team feedback. Most importantly, I would celebrate small wins and highlight examples of successful cross-cultural collaboration to reinforce positive changes.`,

          keyInsights: {
            create: [
              {
                title: "Cultural Intelligence Framework",
                description:
                  "Understanding that cultural differences in teamwork often stem from varying communication styles, hierarchy expectations, and group dynamics.",
              },
              {
                title: "Proactive Communication Strategy",
                description:
                  "Establishing clear channels for open dialogue while respecting different cultural norms around direct versus indirect communication.",
              },
            ],
          },

          answerStructure: {
            create: [
              {
                section: "Situation Assessment",
                purpose:
                  "Acknowledge the challenge and demonstrate understanding of cultural dynamics",
              },
              {
                section: "Communication Framework",
                purpose: "Outline specific strategies for improving cross-cultural communication",
              },
            ],
          },

          highlightedPoints: {
            create: [
              {
                text: "Rather than seeing these differences as obstacles, I would approach this situation as an opportunity",
                insight: "Growth Mindset",
                explanation: "Shows positive framing of challenges",
              },
              {
                text: "organize informal team discussions where members can share their cultural perspectives",
                insight: "Psychological Safety",
                explanation: "Creates safe space for open dialogue",
              },
            ],
          },
        },
      },
    },
  });

  return { success: true, mockInterviewId: mockInterview.id };
}
