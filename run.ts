import { prisma } from "./lib/prisma";
import { generateInterviewResult } from "./lib/actions/generateInterviewResult";

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
      recordingTranscription: `Um... well... if I forgot the lab values, I guess I would just tell the resident I forgot them. Like, I know that's probably bad but everyone makes mistakes right? I would just say 'sorry I don't have those values' and maybe try to look them up real quick on my phone if I could. 

I mean, I know lab values are important and stuff but it's not like the worst thing ever to miss them. The resident probably forgets things sometimes too. And like, I'm just a student so they can't expect me to be perfect.

I could maybe ask another student if they know the values? Or just skip that part of the presentation and focus on the other stuff I do know. The important thing is that I'm being honest about not knowing rather than making something up.

Yeah so basically I'd just apologize and try to work around it. Maybe next time I'll try to remember to check everything but these things happen sometimes. As long as nobody got hurt it's probably fine.

Um... yeah I think that's all I have to say about that.`,
    },
  });

  // Generate feedback
  console.log("Generating feedback...");
  const feedback = await generateInterviewResult(mockInterview.id);
  console.log("Generated feedback:", feedback);
}

createMockInterview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
