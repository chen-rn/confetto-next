import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className={cn("max-w-6xl mx-auto", className)}>{children}</div>
      </div>
    </div>
  );
}
