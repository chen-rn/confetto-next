import { prisma } from "./lib/prisma";
import { generateInterviewFeedback } from "./lib/actions/generateInterviewResult";

async function createMockInterview() {
  /* // Create test question
  const question = await prisma.question.create({
    data: {
      content:
        "A 45-year-old patient refuses a life-saving blood transfusion due to religious beliefs. How would you handle this situation?",
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
      recordingTranscription:
        "As a medical professional, I would first ensure the patient is of sound mind and fully understands the consequences of refusing treatment. I would document their decision and rationale carefully. Then, I would explore alternative treatments that may be acceptable within their religious framework. If none exist, I would respect their autonomy while ensuring they receive the best possible care within their stated limitations. I would also involve the ethics committee and legal team to ensure proper protocols are followed.",
    },
  });
 */
  // Generate feedback
  console.log("Generating feedback...");
  const feedback = await generateInterviewFeedback("a1e14cee-ffe4-43df-8741-bbbf68936a50");
  console.log("Generated feedback:", feedback);
}

createMockInterview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
