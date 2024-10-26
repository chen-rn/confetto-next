import { prisma } from "@/lib/apis/prisma";
import { QuestionFilters } from "./QuestionFilters";

export async function ServerFilters() {
  const tags = await prisma.questionTag.findMany();
  return <QuestionFilters tags={tags} />;
}
