"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookMinimalistic,
  Heart,
  Lightbulb,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { Magnifer } from "@solar-icons/react-perf/Outline";
import Link from "next/link";
import type { ReactNode } from "react";

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: "Stash Your Tabs",
    description:
      "Collect the links you've been hoarding for days. Save them directly into Boards instead of drowning your browser.",
    icon: <BookMinimalistic className="text-primary size-8" />,
  },
  {
    title: "See the Big Picture",
    description:
      "Cluster related tabs and ideas in one place. Patterns emerge. Research becomes insight.",
    icon: <Magnifer className="text-primary size-8" />,
  },
  {
    title: "Work Together Early",
    description:
      "Share Boards with teammates to explore ideas before they turn into tasks, tickets, or documentation.",
    icon: <Heart className="text-primary size-8" />,
  },
  {
    title: "Boards",
    description:
      "Use Boards as your pre-project workspace-then graduate your thinking into your project tools when you're ready.",
    icon: <Lightbulb className="text-primary size-8" />,
  },
];

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

        <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-primary/5 dark:bg-primary/3 border-0 shadow-none"
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="font-display mb-2 text-xl font-semibold md:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
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
