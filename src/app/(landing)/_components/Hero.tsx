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


      </div>
    </section>
  );
};

export default Hero;
