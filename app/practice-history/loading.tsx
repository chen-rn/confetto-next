import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";
import { InterviewHistorySkeleton } from "./InterviewHistorySkeleton";

export default function Loading() {
  return (
    <PageContainer>
      <PageHeader title="Practice History" description="Review your past interview sessions" />
      <InterviewHistorySkeleton />
    </PageContainer>
  );
}
