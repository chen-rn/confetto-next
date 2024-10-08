"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addQuestion } from "@/lib/actions/addQuestion";

export function AddQuestionForm() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await addQuestion(question);
      setQuestion("");
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      router.refresh();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">New Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a new interview question"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Question"}
      </Button>
    </form>
  );
}
