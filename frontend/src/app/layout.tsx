import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "VetoGrid — Intelligent Campus Scheduling & Venue Governance",
  description:
    "Autonomous clash-free timetable optimization, venue management, and Section 4 RBAC governance platform.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF6F2] text-[#683B2B] min-h-screen antialiased selection:bg-[#B08401]/25 selection:text-[#683B2B]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
