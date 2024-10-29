import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InterviewOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryText: string;
  secondaryText: string;
  onClick: () => void;
  isLoading?: boolean;
}

export function InterviewOption({
  icon: Icon,
  title,
  description,
  primaryText,
  secondaryText,
  onClick,
  isLoading,
}: InterviewOptionProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex h-[280px] w-full flex-col rounded-2xl px-6 py-6 text-left",
        "border bg-white transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-70",
        "relative overflow-hidden group"
      )}
    >
      {/* Background gradient effect on hover/active */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-[#635BFF]/5 to-transparent transition-opacity duration-300",
          "opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="flex flex-col h-full relative">
        {/* Icon and Title Section */}
        <div>
          <div className="flex-shrink-0 rounded-lg bg-[#635BFF]/5 p-3 w-fit group-hover:bg-[#635BFF]/10 transition-colors">
            <Icon className="h-6 w-6 text-[#635BFF]" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mt-4">{title}</h3>
          <p className="text-neutral-500 mt-2 text-sm">{description}</p>
        </div>

        {/* Features Section */}
        <div className="mt-6 flex-1">
          <ul className="space-y-3">
            {[primaryText, secondaryText].map((text, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
                <span className="text-sm text-neutral-600">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Section */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
            <div className="flex items-center gap-2 text-[#635BFF] font-medium">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting...
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}
