import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { Suspense } from "react";
import { MockInterviewList } from "./MockInterviewList";

export default async function MockHistoryPage() {
  const { userId } = auth();

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-3xl font-bold">Mock Interview History</h1>
        <div className="w-24" />
      </div>
      <Suspense fallback={<div>Loading mock interview history...</div>}>
        <MockInterviewList userId={userId} />
      </Suspense>
    </div>
  );
}
