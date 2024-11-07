import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Confetti } from "@/components/Confetti";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Rocket } from "lucide-react";

import { WelcomeCards } from "./WelcomeCards";

export default async function WelcomePage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Confetti />
        <div className="w-full max-w-2xl mx-auto">
          <div className="rounded-3xl border bg-white/50 backdrop-blur-sm p-8 shadow-xl space-y-8">
            <WelcomeHeader />
            <WelcomeCards />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function WelcomeHeader() {
  return (
    <div className="space-y-4 text-center">
      <div className="relative inline-flex mx-auto">
        <div className="absolute inset-0 bg-[#635BFF]/20 blur-xl rounded-full" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#635BFF]/80 flex items-center justify-center mx-auto shadow-lg">
          <Rocket className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          You're All Set! <span className="inline-block animate-bounce">🎉</span>
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          Your profile is complete and you're ready to start practicing for your MMI interviews.
          Let's begin your journey to success.
        </p>
      </div>
    </div>
  );
}
