import { Timer, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LinkCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration?: string;
  isPrimary?: boolean;
}

function LinkCard({ href, icon, title, description, duration, isPrimary = false }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={`group relative rounded-2xl transition-all duration-300 ${
        isPrimary
          ? "bg-gradient-to-br from-[#635BFF] to-[#635BFF]/90 hover:to-[#635BFF] text-white shadow-lg hover:shadow-xl hover:shadow-[#635BFF]/10"
          : "bg-white hover:bg-gray-50/80 border border-gray-200/60 hover:border-[#635BFF]/20 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div
            className={`p-2.5 rounded-xl transition-colors duration-300 ${
              isPrimary
                ? "bg-white/10 group-hover:bg-white/20"
                : "bg-[#635BFF]/5 group-hover:bg-[#635BFF]/10"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`text-lg font-medium truncate ${
                  isPrimary ? "text-white" : "text-gray-700"
                }`}
              >
                {title}
              </h3>
              <ArrowRight
                className={`h-5 w-5 transform transition-all duration-300 ${
                  isPrimary
                    ? "text-white/70 group-hover:text-white"
                    : "text-[#635BFF]/50 group-hover:text-[#635BFF]"
                } opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-sm leading-relaxed ${isPrimary ? "text-white/80" : "text-gray-500"}`}>
            {description}
          </p>
          {duration && (
            <div
              className={`text-xs ${
                isPrimary ? "text-white/70" : "text-gray-400"
              } flex items-center gap-1.5`}
            >
              <Timer className="h-3.5 w-3.5" />
              {duration}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const welcomeCards = [
  {
    href: "/mock/new",
    icon: <Timer className="h-6 w-6 text-white" />,
    title: "Start Your First Practice Interview",
    description: "Begin your MMI preparation with a guided practice session",
    duration: "~15-20 minutes",
    isPrimary: true,
  },
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="h-6 w-6 text-[#635BFF]" />,
    title: "View Your Dashboard",
    description: "Access your practice history and track your progress",
  },
] as const;

export function WelcomeCards() {
  return (
    <div className="grid gap-4">
      {welcomeCards.map((card) => (
        <LinkCard key={card.href} {...card} />
      ))}
    </div>
  );
}
