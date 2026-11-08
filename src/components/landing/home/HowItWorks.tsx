"use client";

import FeatureBento from "@/components/landing/home/FeatureBento";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-16 text-center">
          <h2 className="font-display mb-4 text-3xl tracking-tight md:text-5xl">
            From tab overload to{" "}
            <span className="text-primary">clear thinking</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm md:text-lg">
            Collect everything you&apos;re exploring, group related links into
            categories, and turn those clusters into shared Boards your team can
            use to align and plan.
          </p>
        </div>

        <div className="mb-24">
          <FeatureBento />
        </div>

        <div className="text-center">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <span>Linear for pre-projects</span>
          </div>
          <h3 className="font-display mb-4 text-2xl md:text-3xl">
            Stash your tabs. Start turning ideas into plans.
          </h3>
          <Button size="sm" asChild className="group">
            <Link href="/auth/signin">
              Get started with Stashr
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
