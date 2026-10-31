import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "CIT Venue Manager & Timetable System — Chilika Institute of Technology",
  description:
    "Intelligent campus scheduling, automated clash-free timetable generation, and venue management platform for Chilika Institute of Technology (CIT).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F0F4F8] text-slate-800 min-h-screen antialiased selection:bg-[#236B8E]/20 selection:text-[#17445C]">
        {children}
      </body>
    </html>
  );
}
