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
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="text-sm text-muted-foreground">
              Receive updates about your account and new features
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="practice-reminders" className="flex flex-col space-y-1">
            <span>Practice Reminders</span>
            <span className="text-sm text-muted-foreground">
              Get reminded to practice for your MMI interview
            </span>
          </Label>
          <Switch
            id="practice-reminders"
            checked={practiceReminders}
            onCheckedChange={setPracticeReminders}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="feedback-notifications" className="flex flex-col space-y-1">
            <span>Feedback Notifications</span>
            <span className="text-sm text-muted-foreground">
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
