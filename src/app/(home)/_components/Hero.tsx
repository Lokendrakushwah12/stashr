"use client";

import { Button } from "@/components/ui/button";
import PixelBlastClient from "@/components/ui/PixelBlast/pixel-blast-client";
import {
  ArrowRight,
  Lightning,
  LinkMinimalistic,
  User,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 pt-28 pb-8 text-center">
      <div className="mx-auto max-w-7xl">
        <PixelBlastClient />
        <h1 className="font-display mx-auto mb-6 max-w-2xl text-4xl font-[600] tracking-tight md:text-6xl">
          Turn scattered inspiration into{" "}
          <span className="text-primary">organized thinking</span>
        </h1>

        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-sm leading-relaxed md:text-lg">
          Stashr is where ideas take shape—before they become projects. Collect
          links, cluster concepts, and collaborate on Boards that evolve into
          actionable plans.
        </p>

        <div className="mb-16 flex flex-col justify-center gap-2 sm:flex-row md:gap-4">
          <Button size="sm" asChild className="group">
            <Link href="/auth/signin">
              Start Exploring
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="bg-background" asChild>
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
        </div>

        {/* dashboard image */}
        <div className="relative mx-auto max-w-7xl">
          <div className="from-background pointer-events-none absolute bottom-0 z-30 h-60 w-full bg-linear-to-t to-transparent" />
          <div className="border-border/50 bg-background relative aspect-video overflow-hidden rounded-sm border border-b-0 select-none lg:rounded-t-2xl">
            <img
              src="/og.png"
              alt="Stashr Dashboard Preview"
              className="hidden h-full w-full object-cover dark:block"
              width={1200}
              height={630}
            />
            <img
              src="/og-light.png"
              alt="Stashr Dashboard Preview"
              className="block h-full w-full object-cover dark:hidden"
              width={1200}
              height={630}
            />
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto my-16 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <LinkMinimalistic className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-display mb-2 text-2xl md:text-3xl">
              Collect Everything
            </h3>
            <p className="text-muted-foreground text-sm">
              Save links, ideas, and inspiration from anywhere. No more
              scattered tabs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <User className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-display mb-2 text-2xl md:text-3xl">
              Think Together
            </h3>
            <p className="text-muted-foreground text-sm">
              Collaborate on Boards with your team. Share context, not just
              tasks.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Lightning className="text-primary h-6 w-6" />
            </div>
            <h3 className="font-display mb-2 text-2xl md:text-3xl">
              Evolve Ideas
            </h3>
            <p className="text-muted-foreground text-sm">
              Turn Boards into actionable plans. Build your own Idea.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
