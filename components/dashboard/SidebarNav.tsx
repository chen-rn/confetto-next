"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, History, Calendar, BarChart2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function SidebarNav() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const router = useRouter();

  const handleNavClick = (navItem: string) => {
    setActiveNav(navItem);
    switch (navItem) {
      case "Dashboard":
        router.push(ROUTES.HOME);
        break;
      case "Calendar":
        // Assuming there's no specific route for Calendar yet
        break;
      case "Analytics":
        // Assuming there's no specific route for Analytics yet
        break;
      case "Question Bank":
        // Assuming there's no specific route for Question Bank yet
        router.push(ROUTES.CREATE_MOCK);

        break;
      case "Practice History":
        router.push(ROUTES.MOCK_HISTORY);
        break;
      case "TEST":
        router.push(ROUTES.LIVEKIT_TEST);
        break;
    }
  };

  return (
    <nav className="space-y-1">
      {[
        "Dashboard",
        /*  "Calendar", "Analytics",  */ "Question Bank",
        "Practice History",
        "TEST",
      ].map((item) => (
        <Button
          key={item}
          variant={activeNav === item ? "secondary" : "ghost"}
          className={`w-full justify-start ${
            activeNav === item ? "bg-[#F0F4FF] text-[#635BFF]" : "text-gray-600"
          } hover:bg-[#F0F4FF] hover:text-[#635BFF]`}
          onClick={() => handleNavClick(item)}
        >
          {item === "Dashboard" && <Home className="mr-2 h-4 w-4" />}
          {item === "Calendar" && <Calendar className="mr-2 h-4 w-4" />}
          {item === "Analytics" && <BarChart2 className="mr-2 h-4 w-4" />}
          {item === "Question Bank" && <BookOpen className="mr-2 h-4 w-4" />}
          {item === "Practice History" && <History className="mr-2 h-4 w-4" />}
          {item}
        </Button>
      ))}
    </nav>
  );
}
