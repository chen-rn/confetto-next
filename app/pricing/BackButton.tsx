"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="absolute left-4 top-4 text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}
