// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";
import { CSPostHogProvider } from "@/components/CSPostHogProvider";
import { Toaster } from "@/components/ui/toaster";
import { DynamicSidebar } from "@/components/DynamicSidebar";

export const metadata: Metadata = {
  title: "Confetto - AI-Powered MMI Interview Prep",
  description:
    "Enhance your medical school interview skills with our AI-driven Multiple Mini Interview (MMI) preparation platform. Practice realistic scenarios, receive personalized feedback, and track your progress.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      await prisma.user.create({ data: { id: userId } });
    }
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <CSPostHogProvider>
          <ClerkProvider>
            <DynamicSidebar>{children}</DynamicSidebar>
            <Toaster />
          </ClerkProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
