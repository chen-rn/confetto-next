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
      <header className="p-2 sm:p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              Home
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Interview</h1>
          <div className="w-[60px] sm:w-[88px]" /> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 overflow-hidden">
        {/*    <div className="w-full bg-white p-2 sm:p-4 rounded-lg shadow-sm overflow-auto max-h-[30vh]">
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Question:</h2>
          <p className="text-base sm:text-lg">{question.content}</p>
        </div> */}
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-sm flex-grow">
          <CameraView mockId={mockId} question={question.content} />
        </div>
      </main>
    </div>
  );
}
