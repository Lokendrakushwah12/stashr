"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, BookOpenIcon, LightbulbIcon, RocketIcon, ShareIcon } from "@phosphor-icons/react";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-[86rem] px-5 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display tracking-tight mb-4">
            From scattered ideas to{" "}
            <span className="text-primary">organized action</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stashr bridges the gap between inspiration and execution. 
            Here&apos;s how knowledge workers turn curiosity into clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16">
          <Card className="border-0 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 mx-auto">
                <BookOpenIcon weight="duotone" className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl mb-2">1. Collect</h3>
              <p className="text-sm text-muted-foreground">
                Save links, articles, and inspiration as you discover them. 
                No more bookmark chaos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 mx-auto">
                <LightbulbIcon weight="duotone" className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl mb-2">2. Cluster</h3>
              <p className="text-sm text-muted-foreground">
                Organize related ideas into Boards. 
                See patterns emerge from your research.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 mx-auto">
                <ShareIcon weight="duotone" className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl mb-2">3. Collaborate</h3>
              <p className="text-sm text-muted-foreground">
                Share Boards with your team. 
                Build shared understanding before committing to action.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span>Linear for pre-projects</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl mb-4">
            Ready to turn inspiration into action?
          </h3>
          <Button size="sm" asChild className="group">
            <Link href="/auth/signin">
              Start Your First Board
              <ArrowRightIcon weight="duotone" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
