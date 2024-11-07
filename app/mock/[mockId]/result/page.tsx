import { InterviewResults } from "@/components/interview-results";

export default function ResultPage({ params }: { params: { mockId: string } }) {
  return <InterviewResults mockInterviewId={params.mockId} />;
}
