import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MockInterview {
  id: string;
  question: {
    content: string;
  };
  recordingUrl?: string;
  createdAt: Date;
}

export default async function MockHistoryPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const mockInterviews = await prisma.mockInterview.findMany({
    where: { userId },
    select: {
      id: true,
      question: { select: { content: true } },
      recordingUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!mockInterviews) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-3xl font-bold">Mock Interview History</h1>
        <div className="w-24" />
      </div>
      {mockInterviews.length === 0 ? (
        <p className="text-center text-gray-600">You haven't completed any mock interviews yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6">
          {mockInterviews.map((interview) => (
            <Card key={interview.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-gray-700">"{interview.question.content}"</div>
                <div className="text-sm text-gray-500">
                  Date: {new Date(interview.createdAt).toLocaleDateString()}
                </div>
                <div
                  className={`text-sm font-medium ${
                    interview.recordingUrl ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {interview.recordingUrl ? "Completed" : "Incomplete"}
                </div>
              </div>
              <Link href={ROUTES.MOCK_RESULT(interview.id)}>
                <Button variant="default">View Details</Button>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
