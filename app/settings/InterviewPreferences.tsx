"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { updateUserPreferences } from "@/lib/actions/user";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { addDays } from "date-fns";

interface InterviewPreferencesProps {
  mmiDate: Date | null;
  primaryConcern: string | null;
}

export function InterviewPreferences({ mmiDate }: InterviewPreferencesProps) {
  const [date, setDate] = useState<Date | undefined>(mmiDate ?? undefined);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  async function handleSave(newDate: Date | undefined) {
    try {
      setIsUpdating(true);
      await updateUserPreferences({ mmiDate: newDate });
      setDate(newDate);
      toast({
        title: "Success",
        description: "Interview date updated successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interview date",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Date</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {date ? format(date, "MMMM d, yyyy") : "No interview date set"}
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Date
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Interview Date</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => handleSave(newDate)}
                className="rounded-md border"
                fromDate={addDays(new Date(), 1)} // Disable past dates and today
                disabled={(date) => date < addDays(new Date(), 1)} // Additional safety check
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
