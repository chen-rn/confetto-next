import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
      <span className="ml-2 text-muted-foreground">Preparing your interview...</span>
    </div>
  );
}
