import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coach Sign-Up",
  description: "Join ForeSports as a founding golf coach. Create your coaching profile and get listed in the ForeSports coach directory.",
  alternates: { canonical: "/coach-profile" },
  robots: { index: true, follow: true },
};

export default function CoachProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
