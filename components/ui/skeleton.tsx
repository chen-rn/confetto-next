import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />;
}

export { Skeleton };
