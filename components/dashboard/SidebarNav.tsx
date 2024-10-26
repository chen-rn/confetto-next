"use client";

import { usePathname } from "next/navigation";
import { Home, History, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
    href: ROUTES.DASHBOARD,
  },
  {
    label: "Question Bank",
    icon: <BookOpen className="mr-2 h-4 w-4" />,
    href: ROUTES.QUESTION_BANK,
  },
  {
    label: "Practice History",
    icon: <History className="mr-2 h-4 w-4" />,
    href: ROUTES.MOCK_HISTORY,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
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
          "w-full justify-start relative",
          isActive
            ? "bg-[#F0F4FF] text-[#635BFF] border-l-2 border-[#635BFF]"
            : "text-gray-600 hover:bg-[#F0F4FF] hover:text-[#635BFF]"
        )}
        asChild
      >
        <Link href={item.href} prefetch>
          {item.icon}
          {item.label}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className="space-y-1">
        {mainNavItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </nav>
      <nav className="space-y-1">
        {bottomNavItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </nav>
    </div>
  );
}
