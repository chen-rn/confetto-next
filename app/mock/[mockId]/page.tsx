import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/apis/prisma";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { CameraView } from "@/components/CameraView";
import { Button } from "@/components/ui/button";

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
    redirect(ROUTES.MOCK_RESULT(mockId));
  }

  const { question } = mockInterview;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={ROUTES.HOME}>
            <Button variant="outline">Home</Button>
          </Link>
          <h1 className="text-2xl font-bold">Interview</h1>
          <div className="w-[88px]" /> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Question:</h2>
          <p className="text-lg mb-4">{question.content}</p>
        </div>
        <div className="w-full md:w-3/4 bg-black rounded-lg overflow-hidden shadow-lg">
          <CameraView mockId={mockId} />
        </div>
      </main>
    </div>
  );
}