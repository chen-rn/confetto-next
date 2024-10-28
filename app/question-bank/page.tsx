import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ROUTES } from "@/lib/routes";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "./QuestionsList";
import { Card } from "@/components/ui/card";

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams?: { topics?: string };
}) {
  const userId = auth().userId;
  if (!userId) redirect(ROUTES.SIGN_IN);

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Question Bank</h1>
            <p className="text-gray-500 text-sm">Browse and manage your practice questions</p>
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

        {/* Main Content Card */}
        <Card className="overflow-hidden">
          <QuestionsList />
        </Card>
      </div>
    </div>
  );
}
