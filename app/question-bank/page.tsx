import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ROUTES } from "@/lib/routes";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuestionsList } from "./QuestionsList";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams?: { topics?: string };
}) {
  const userId = auth().userId;
  if (!userId) redirect(ROUTES.SIGN_IN);

  return (
    <PageContainer>
      <PageHeader title="Question Bank" description="Browse and manage your practice questions">
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
      </PageHeader>

      <Card className="overflow-hidden">
        <QuestionsList />
      </Card>
    </PageContainer>
  );
}
