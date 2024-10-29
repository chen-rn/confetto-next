"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignOutContainer() {
  const { signOut } = useClerk();

  return (
    <div className="flex justify-end">
      <Button onClick={() => signOut()} variant="destructive" size="sm">
        Sign Out
      </Button>
    </div>
  );
}
