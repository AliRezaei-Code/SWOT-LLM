import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const font = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SWOT Chatbot",
  description:
    "Internal RAG assistant for synthesising SWOT insights with traceable citations.",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0b1120" }, { color: "#ffffff" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", font.variable)}>
        <div className="relative flex min-h-screen flex-col" data-testid="app-root">
          {children}
        </div>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
