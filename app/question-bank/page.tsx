import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { ServerFilters } from "./ServerFilters";
import { ServerQuestions } from "./ServerQuestions";
import { Skeleton } from "@/components/ui/skeleton";

export default async function QuestionBankPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-2xl font-bold">Practice Questions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<FiltersSkeleton />}>
            <ServerFilters />
          </Suspense>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3">
          <Suspense fallback={<QuestionsListSkeleton />}>
            <ServerQuestions userId={userId} />
          </Suspense>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-lg font-semibold mb-4">Add a new question:</h2>
        <AddQuestionForm />
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}

function QuestionsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
