"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { shouldShowSidebar } from "@/lib/routes";
import { SidebarNav } from "@/app/dashboard/SidebarNav";

interface DynamicSidebarProps {
  children: React.ReactNode;
}

export function DynamicSidebar({ children }: DynamicSidebarProps) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const showSidebar = shouldShowSidebar(pathname);

  if (!isSignedIn || !showSidebar) {
    return <div className="flex-1 overflow-auto bg-white w-full">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r border-gray-100 bg-gradient-to-b from-white to-gray-50 text-gray-500 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Confetto
          </h1>
          <p className="text-xs text-gray-400 font-medium">AI-Powered MMI Prep</p>
        </div>
        <SidebarNav />
        <div className="mt-auto p-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Connected to AI</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#fafafa]">{children}</div>
    </div>
  );
}
