import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Atkinson_Hyperlegible, Baloo_2, IBM_Plex_Mono } from "next/font/google";
import { ProgressProvider } from "@/lib/progress/provider";
import { Topbar } from "@/components/topbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});
const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "TypeQuest",
  description:
    "A typing adventure for home learners — 41 lessons, arcade games, and progress that follows you anywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${baloo.variable} ${atkinson.variable} ${plex.variable}`}>
        <body className="min-h-screen antialiased">
          <ProgressProvider>
            <Topbar />
            <main className="mx-auto max-w-5xl px-5 pb-20 pt-6">{children}</main>
            <Toaster position="top-center" />
          </ProgressProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
