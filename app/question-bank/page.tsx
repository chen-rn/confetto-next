import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "./QuestionsList";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";
import { Suspense } from "react";
import { QuestionsLoading } from "./QuestionsLoading";

export default function QuestionBankPage() {
  return (
    <PageContainer>
      <PageHeader title="Question Bank" description="Browse and manage your practice questions">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-2 bg-[#635BFF] hover:bg-[#635BFF]/90 rounded-lg">
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
      </PageHeader>

      <Suspense fallback={<QuestionsLoading />}>
        <QuestionsList />
      </Suspense>
    </PageContainer>
  );
}
