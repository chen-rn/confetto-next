// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { CSPostHogProvider } from "@/components/providers/CSPostHogProvider";
import { Toaster } from "@/components/ui/toaster";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { UserInitializer } from "@/components/UserInitializer";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthRedirect } from "@/components/AuthRedirect";
import { MetadataUpdater } from "@/components/MetadataUpdater";
import { VideoPreloader } from "@/app/mock/[mockId]/components/VideoPreloader";

export const metadata: Metadata = {
  title: "Confetto - AI Powered MMI Interview Prep",
  description:
    "Enhance your medical school interview skills with our AI-driven Multiple Mini Interview (MMI) preparation platform. Practice realistic scenarios, receive personalized feedback, and track your progress.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <CSPostHogProvider>
          <QueryProvider>
            <NuqsAdapter>
              <ClerkProvider>
                <MetadataUpdater />
                <UserInitializer />
                <AuthRedirect />
                <VideoPreloader />
                <Toaster />
                <DynamicSidebar>{children}</DynamicSidebar>
              </ClerkProvider>
            </NuqsAdapter>
          </QueryProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
