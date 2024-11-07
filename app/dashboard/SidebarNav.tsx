"use client";

import { usePathname } from "next/navigation";
import { Home, History, BookOpen, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <Home className="mr-3 h-4 w-4" />,
    href: ROUTES.DASHBOARD,
  },
  {
    label: "Question Bank",
    icon: <BookOpen className="mr-3 h-4 w-4" />,
    href: ROUTES.QUESTION_BANK,
  },
  {
    label: "Practice History",
    icon: <History className="mr-3 h-4 w-4" />,
    href: ROUTES.MOCK_HISTORY,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    icon: <Settings className="mr-3 h-4 w-4" />,
    href: ROUTES.SETTINGS,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    return (
      <Button
        key={item.label}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start relative px-4 py-6 transition-all duration-200 rounded-none",
          isActive
            ? "bg-gradient-to-r from-[#635BFF]/10 to-transparent text-[#4b45cc] border-l-4 border-[#635BFF] font-medium"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800"
        )}
        asChild
      >
        <Link href={item.href} prefetch className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center">
            {item.badge && (
              <span className="bg-[#635BFF]/10 text-[#635BFF] text-xs px-2 py-0.5 rounded-full mr-2">
                {item.badge}
              </span>
            )}
            {isActive && <ChevronRight className="h-4 w-4 text-[#635BFF]" />}
          </div>
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex h-full flex-col justify-between py-4">
      <div>
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavButton key={item.label} item={item} />
          ))}
        </nav>
      </div>
      <nav className="space-y-1">
        {bottomNavItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}
