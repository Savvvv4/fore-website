import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coach Profile Builder",
  description: "Create and preview your coaching profile with ForeSports.",
  robots: { index: false, follow: true },
};

export default function CoachProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
