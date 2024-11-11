import { Loader2 } from "lucide-react";

export function ProcessingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <Loader2 className="h-10 w-10 animate-spin text-[#635BFF]" />
      <h2 className="text-xl font-semibold">Processing Your Interview</h2>
      <p className="text-center text-muted-foreground">
        We're analyzing your responses and preparing detailed feedback. This may take a few minutes.
      </p>
    </div>
  );
}
