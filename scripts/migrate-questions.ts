import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function clearExistingData() {
  // Delete in order to respect foreign key constraints
  await prisma.componentScore.deleteMany({});
  await prisma.analysisPoint.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.mockInterview.deleteMany({});
  await prisma.scoringCriteria.deleteMany({});
  
  // Delete AnswerKey related tables first
  await prisma.keyInsight.deleteMany({});
  await prisma.answerStructure.deleteMany({});
  await prisma.highlightedPoint.deleteMany({});
  await prisma.answerKey.deleteMany({});
  
  // Finally delete questions
  await prisma.question.deleteMany({});
  
  console.log("Cleared existing data");
}

async function parseQuestions(filePath: string): Promise<Array<{ content: string; tags: string[] }>> {
  const content = fs.readFileSync(filePath, "utf-8");
  // Split by double newline and filter out empty entries
  const questions = content
    .split("\n\n")
    .map(q => q.trim())
    .filter(q => q.length > 0);
  
  return questions.map(q => {
    // Find the last occurrence of [ to handle questions that might contain brackets in their content
    const lastOpenBracket = q.lastIndexOf('[');
    const lastCloseBracket = q.lastIndexOf(']');
    
    if (lastOpenBracket === -1 || lastCloseBracket === -1 || lastOpenBracket > lastCloseBracket) {
      console.warn("Question format not recognized:", q);
      return { content: q.trim(), tags: [] };
    }
    
    const content = q.substring(0, lastOpenBracket).trim();
    const tagsString = q.substring(lastOpenBracket + 1, lastCloseBracket);
    const tags = tagsString.split(',').map(tag => tag.trim());
    
    return { content, tags };
  });
}

async function createQuestions(questions: Array<{ content: string; tags: string[] }>) {
  for (const question of questions) {
    const existingTags = await prisma.questionTag.findMany({
      where: {
        name: {
          in: question.tags
        }
      }
    });

    await prisma.question.create({
      data: {
        content: question.content,
        tags: {
          connect: existingTags.map(tag => ({ id: tag.id }))
        }
      }
    });
  }
  
  console.log("Created new questions");
}

async function main() {
  try {
    console.log("Starting migration...");
    
    // Clear existing data
    await clearExistingData();
    
    // Parse and create new questions
    const questions = await parseQuestions(path.join(__dirname, "newquestions.txt"));
    console.log(`Found ${questions.length} questions to migrate`);
    
    await createQuestions(questions);
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
