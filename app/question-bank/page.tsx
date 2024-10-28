import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { ROUTES } from "@/lib/routes";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { ServerFilters } from "./ServerFilters";
import { ServerQuestions } from "./ServerQuestions";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "./QuestionsList";

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams?: { topics?: string };
}) {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  return (
    // Add overflow-y-scroll to always show scrollbar
    <div className="flex h-screen bg-neutral-100 overflow-y-scroll">
      <div className="flex-1 p-8">
        {/* Add max-w-[1400px] for consistent max width */}
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Question Bank</h1>
              <p className="text-gray-400 text-sm">Browse and manage your practice questions</p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <div className="mt-6">
                  <AddQuestionForm />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters - Add w-full to ensure consistent width */}
            <aside className="lg:col-span-1 w-full">
              <div className="sticky top-8 w-full">
                <ServerFilters />
              </div>
            </aside>

            {/* Questions List */}
            <main className="lg:col-span-3">
              <QuestionsList />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function QuestionsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
