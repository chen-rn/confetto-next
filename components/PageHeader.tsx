import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn("flex flex-col sm:flex-row justify-between items-start gap-4 mb-8", className)}
    >
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800 mb-1">{title}</h1>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
