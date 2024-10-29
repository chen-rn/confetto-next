import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Confetti } from "@/components/Confetti";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/30">
      <Confetti />
      <div className="w-full max-w-2xl px-4 text-center">
        <div className="rounded-xl border bg-white p-12 shadow-sm space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">You're All Set! 🎉</h1>
            <p className="text-muted-foreground text-lg">
              Your profile is complete and you're ready to start practicing for your MMI interviews.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Link href="/mock/new" className="w-full max-w-sm">
                <Button size="lg" className="w-full">
                  Start Your First Practice Interview
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">Takes about 15-20 minutes</span>
            </div>

            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="ghost">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
