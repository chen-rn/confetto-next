import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/apis/prisma";
import MicButton from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MockPageProps {
  params: {
    mockId: string;
  };
}

export default async function MockPage({ params }: MockPageProps) {
  const { mockId } = params;

  if (!mockId) {
    notFound();
  }

  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: { question: true },
  });

  if (!mockInterview || !mockInterview.question) {
    notFound();
  }

  if (mockInterview.recordingUrl) {
    redirect(`/mock/${mockId}/result`);
  }

  const { question } = mockInterview;

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="outline" className="mb-4">
          Home
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-4">Mock Question:</h1>
      <p className="text-lg mb-6">{question.content}</p>
      <div className="mt-8">
        <MicButton mockId={mockId} />
      </div>
    </div>
  );
}
