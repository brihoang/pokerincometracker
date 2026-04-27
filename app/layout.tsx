import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import NavBar from "@/app/components/NavBar";
import OpenSessionBanner from "@/app/components/OpenSessionBanner";
import AuthSync from "@/app/components/AuthSync";
import MigrationBanner from "@/app/components/MigrationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Tracker",
  description: "Track your cash game sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ theme: dark }}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <AuthSync />
          <MigrationBanner />
          <NavBar />
          <OpenSessionBanner />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
