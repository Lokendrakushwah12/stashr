"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRightIcon,
  BookOpenIcon,
  LightbulbIcon,
  ShareIcon
} from "@phosphor-icons/react";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-[86rem] px-5">
        <div className="mb-16 text-center">
          <h2 className="font-display mb-4 text-3xl tracking-tight md:text-5xl">
            From scattered ideas to{" "}
            <span className="text-primary">organized action</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm md:text-lg">
            Stashr bridges the gap between inspiration and execution.
            Here&apos;s how knowledge workers turn curiosity into clarity.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="bg-background/50 border-0 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <BookOpenIcon
                  weight="duotone"
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="font-display mb-2 text-2xl md:text-3xl">
                1. Collect
              </h3>
              <p className="text-muted-foreground text-sm">
                Save links, articles, and inspiration as you discover them. No
                more bookmark chaos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-0 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/20">
                <LightbulbIcon
                  weight="duotone"
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="font-display mb-2 text-2xl md:text-3xl">
                2. Cluster
              </h3>
              <p className="text-muted-foreground text-sm">
                Organize related ideas into Boards. See patterns emerge from
                your research.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-0 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20">
                <ShareIcon
                  weight="duotone"
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="font-display mb-2 text-2xl md:text-3xl">
                3. Collaborate
              </h3>
              <p className="text-muted-foreground text-sm">
                Share Boards with your team. Build shared understanding before
                committing to action.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <span>Linear for pre-projects</span>
          </div>
          <h3 className="font-display mb-4 text-2xl md:text-3xl">
            Ready to turn inspiration into action?
          </h3>
          <Button size="sm" asChild className="group">
            <Link href="/auth/signin">
              Start Your First Board
              <ArrowRightIcon
                weight="duotone"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
