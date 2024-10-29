"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BackToDashboard() {
  return (
    <div className="flex items-center">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
