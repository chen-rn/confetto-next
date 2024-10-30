import { Suspense } from "react";
import InterviewOptions from "./InterviewOptions";
import { BackToDashboard } from "./BackToDashboard";
import { InterviewOptionsSkeletons } from "./InterviewOptionsSkeletons";

export default function NewMockInterviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-100/50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <BackToDashboard />

        {/* Center content vertically */}
        <div className="flex flex-col justify-center min-h-[calc(100vh-200px)] pb-14">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              Start Interview
            </h1>
            <p className="text-gray-600 text-lg">Choose your preferred practice mode to begin</p>
          </div>

          {/* Cards Grid */}
          <div className="max-w-5xl mx-auto w-full">
            <Suspense fallback={<InterviewOptionsSkeletons />}>
              <InterviewOptions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
