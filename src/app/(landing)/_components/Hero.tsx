"use client";

import { Button } from "@/components/ui/button";
import { StashrLogo } from "@/components/ui/icons";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="container flex flex-col items-center mt-28 justify-center min-h-[60vh] text-center">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <StashrLogo width={80} />
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold mb-6">
          Organize Your Bookmarks
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stashr helps you organize your web bookmarks into beautiful, colorful folders.
          Never lose track of your favorite websites again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="sm" asChild>
            <Link href="/auth/signin">
              Get Started
            </Link>
          </Button>
        </div>

        {/* dashboard image */}
        <div className="relative max-w-7xl mx-auto">
          <div className="absolute bottom-0 z-30 w-full h-60 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          <div className="relative rounded-t-2xl bg-[#09090b] overflow-hidden border border-border/50 border-b-0">
            <img
              src="/og.png"
              alt="Stashr Dashboard Preview"
              className="w-full h-auto object-cover scale-105 mt-5"
              width={1200}
              height={630}
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
