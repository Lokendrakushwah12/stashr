"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Hero from "./_components/Hero";

export default function LandingPage() {
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
    </div>
  );
}
