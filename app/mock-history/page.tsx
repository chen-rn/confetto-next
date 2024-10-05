import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MockHistoryPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const mockInterviews = await prisma.mockInterview.findMany({
    where: { userId },
    include: { question: true, feedback: true },
    orderBy: { createdAt: "desc" },
  });

  if (!mockInterviews) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="outline" className="mb-4">
          Home
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">Mock Interview History</h1>
      {mockInterviews.length === 0 ? (
        <p>You haven't completed any mock interviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {mockInterviews.map((interview) => (
            <li key={interview.id} className="bg-gray-100 p-4 rounded-lg relative">
              {!interview.recordingUrl && (
                <span className="text-sm text-gray-500 mr-2">Incomplete</span>
              )}
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">Question: {interview.question.content}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Date: {new Date(interview.createdAt).toLocaleString()}
              </p>
              {interview.recordingUrl ? (
                <audio src={interview.recordingUrl} controls className="mb-2" />
              ) : (
                <p className="text-sm text-yellow-600 mb-2">No recorded audio available</p>
              )}
              {interview.feedback && (
                <div className="mt-2">
                  <h3 className="font-semibold">Feedback:</h3>
                  <p>{interview.feedback.content}</p>
                </div>
              )}
              <Link href={`/mock/${interview.id}/result`}>
                <Button variant="outline" className="mt-2">
                  View Details
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
