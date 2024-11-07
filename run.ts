import { prisma } from "./lib/prisma";
import { generateInterviewFeedback } from "./lib/actions/generateInterviewResult";

async function createMockInterview() {
  const question = await prisma.question.create({
    data: {
      content:
        "You are a medical student on your first clinical rotation. A senior resident asks you to present a patient case during rounds, but you realize you forgot to check some key lab values. How do you handle this situation?",
      tags: {
        connectOrCreate: {
          where: { name: "Ethics" },
          create: {
            name: "Ethics",
            type: "TOPIC",
          },
        },
      },
    },
  });

  // Create mock interview
  const mockInterview = await prisma.mockInterview.create({
    data: {
      userId: "user_2mzVKXfIYcqv7DWBMPk9XZclugB",
      questionId: question.id,
      recordingTranscription: `C
it should be ab it longer, MMI quesitons generally take about 5 minutes to answer via verbal speech


Ah yes, you're right - let me provide a longer 6/10 response that would fill about 5 minutes of speaking time:

"In this situation, I would prioritize transparency and professionalism while ensuring proper patient care. I would directly address the senior resident and say, 'Dr. [Name], I apologize, but I need to be honest - I haven't reviewed all the key lab values for this patient. I don't feel comfortable presenting incomplete information that could affect patient care decisions. Would it be acceptable if I quickly access the chart to check these values before presenting?'

If given permission, I would efficiently look up the missing information. However, if the resident needs to keep rounds moving, I would understand and offer to present the information I do have while clearly noting which lab values I still need to verify. I could say something like, 'I can present the patient's history, physical exam findings, and the lab values I have reviewed, but I'll need to follow up on [specific missing labs] afterward.'

This experience would definitely be a learning opportunity for me. Moving forward, I would implement a more structured approach to my patient prep work. For example, I would create a standardized checklist that includes all essential elements needed for a thorough presentation - vital signs, lab values, imaging results, and overnight events. I would also start preparing for rounds earlier in the morning to ensure I have time to gather all necessary information.

I recognize that my lack of preparation could impact the efficiency of rounds and potentially affect the team's workflow. Medicine is a team-based profession, and being unprepared not only reflects poorly on me but also affects my colleagues who rely on accurate information for patient care decisions.

Additionally, I understand that in the real medical setting, such oversights could have more serious consequences. While this is a relatively minor situation, it highlights the importance of attention to detail in medicine. Every piece of information, including lab values, could be crucial for patient care decisions.

I would also make sure to follow up with the resident later to demonstrate that I've learned from this experience. I could share my new preparation system and ask for any additional advice they might have on efficiently preparing for rounds.

While this mistake is unfortunate, I believe handling it with honesty and professionalism, while using it as an opportunity for improvement, is the best approach in this situation.`,
    },
  });

  // Generate feedback
  console.log("Generating feedback...");
  const feedback = await generateInterviewFeedback(mockInterview.id);
  console.log("Generated feedback:", feedback);
}

createMockInterview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
