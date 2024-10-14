"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

export function DynamicSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar =
    !pathname.startsWith("/mmi-interview-interface") && !pathname.startsWith("/mock");

  return (
    <div className="flex h-screen">
      {showSidebar && (
        <div className="w-64 bg-white text-gray-800 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-10-04%20at%2010.16.41%E2%80%AFPM-4hFlx0Az7EwTaqSDhnUPTjQmC0X8Cn.png"
              alt="Confetto Logo"
              className="h-16 w-auto"
            />
          </div>
          <SidebarNav />
        </div>
      )}
      <div className={`flex-1 overflow-auto bg-gray-50 ${showSidebar ? "" : "w-full"}`}>
        {children}
      </div>
    </div>
  );
}
