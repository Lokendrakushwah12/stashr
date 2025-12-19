"use client";

import Hero from "@/components/landing/home/Hero";
import HowItWorks from "@/components/landing/home/HowItWorks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/board");
    }
  }, [session, router]);

  return (
    <div className="relative">
      <Hero />
      <HowItWorks />
    </div>
  );
}
