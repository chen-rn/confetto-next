import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";

async function getRecentPractice() {
  const { userId } = auth();
  if (!userId) return [];

  return await prisma.mockInterview.findMany({
    where: { userId },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      question: {
        select: { content: true },
      },
      feedback: {
        select: { overallScore: true },
      },
    },
  });
}

function getScoreBadgeVariant(score: number) {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
}

export async function RecentPractice() {
  const recentPractice = await getRecentPractice();

  return (
    <Card className="bg-white border shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Practice</CardTitle>
        <Link href={ROUTES.MOCK_HISTORY}>
          <Button variant="ghost" size="sm" className="text-[#635BFF]">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] overflow-auto">
        {recentPractice.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="mb-2">No practice sessions yet</p>
            <Link href={ROUTES.START_INTERVIEW}>
              <Button variant="outline" size="sm">
                Start Practice
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {recentPractice.map((practice) => (
              <Link href={ROUTES.MOCK_RESULT(practice.id)} key={practice.id}>
                <li className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {practice.question.content}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {new Date(practice.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {practice.feedback && (
                    <Badge
                      variant={getScoreBadgeVariant(practice.feedback.overallScore)}
                      className="flex-shrink-0"
                    >
                      {practice.feedback.overallScore}%
                    </Badge>
                  )}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
