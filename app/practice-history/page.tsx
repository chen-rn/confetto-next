import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";
import { InterviewHistorySkeleton } from "./InterviewHistorySkeleton";
import { MockInterviewsList } from "./MockInterviewsList";

export default async function PracticeHistoryPage() {
  return (
    <PageContainer>
      <PageHeader title="Practice History" description="Review your past interview sessions" />
      <Suspense fallback={<InterviewHistorySkeleton />}>
        <MockInterviewsList />
      </Suspense>
    </PageContainer>
  );
}
