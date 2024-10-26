"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { shouldShowSidebar } from "@/lib/routes";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

interface DynamicSidebarProps {
  children: React.ReactNode;
}

export function DynamicSidebar({ children }: DynamicSidebarProps) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  // Check if current route should show sidebar
  const showSidebar = shouldShowSidebar(pathname);

  // If not signed in or route should hide sidebar, render without sidebar
  if (!isSignedIn || !showSidebar) {
    return <div className="flex-1 overflow-auto bg-gray-50 w-full">{children}</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-white text-gray-800 p-4 shadow-sm flex flex-col">
        <div className="mb-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-10-04%20at%2010.16.41%E2%80%AFPM-4hFlx0Az7EwTaqSDhnUPTjQmC0X8Cn.png"
            alt="Confetto Logo"
            className="h-16 w-auto"
          />
        </div>
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
    </div>
  );
}
