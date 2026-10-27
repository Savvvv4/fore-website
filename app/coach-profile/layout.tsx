import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Golf Coaching",
  description: "Create your ForeSports coach profile in five minutes and get found by golfers looking for lessons in your city.",
  alternates: { canonical: "/coach-profile" },
  robots: { index: true, follow: true },
};

export default function CoachProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
