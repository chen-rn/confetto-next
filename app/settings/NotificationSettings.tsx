"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [feedbackNotifications, setFeedbackNotifications] = useState(true);

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1.5">
            <span className="font-medium">Email Notifications</span>
            <span className="text-sm text-muted-foreground font-normal">
              Receive updates about your account and new features
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="practice-reminders" className="flex flex-col space-y-1.5">
            <span className="font-medium">Practice Reminders</span>
            <span className="text-sm text-muted-foreground font-normal">
              Get reminded to practice for your MMI interview
            </span>
          </Label>
          <Switch
            id="practice-reminders"
            checked={practiceReminders}
            onCheckedChange={setPracticeReminders}
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="feedback-notifications" className="flex flex-col space-y-1.5">
            <span className="font-medium">Feedback Notifications</span>
            <span className="text-sm text-muted-foreground font-normal">
              Get notified when your interview feedback is ready
            </span>
          </Label>
          <Switch
            id="feedback-notifications"
            checked={feedbackNotifications}
            onCheckedChange={setFeedbackNotifications}
          />
        </div>
      </CardContent>
    </Card>
  );
}
