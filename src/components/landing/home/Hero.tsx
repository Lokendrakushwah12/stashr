"use client";

import { Button } from "@/components/ui/button";
import PixelBlastClient from "@/components/ui/PixelBlast/pixel-blast-client";
import {
  ArrowRight,
  Lightning,
  LinkMinimalistic,
  User,
} from "@solar-icons/react-perf/category/style/BoldDuotone";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Hero = () => {
  const { data: session } = useSession();
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 pt-28 pb-8 text-center">
      <div className="mx-auto max-w-7xl">
        <PixelBlastClient />
        <h1 className="font-display mx-auto mb-6 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
          Turn <span className="text-primary">tab</span> chaos into organized,{" "}
          <br />
          <span className="text-primary">collaborative</span> Boards.
        </h1>

        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-sm leading-relaxed md:text-lg">
          Stash your open tabs, bookmarks, and scattered ideas into one place -
          so you can sort, structure, and collaborate on them.
        </p>

        <div className="mb-16 flex flex-col justify-center gap-2 sm:flex-row md:gap-4">
          <Button size="sm" asChild className="group">
            <Link href={session ? "/board" : "/auth/signin"}>
              {session ? "Dashboard" : "Get Early Access"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
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

        {/* Explanatory text */}
        <div className="mx-auto my-16 max-w-4xl text-center">
          <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
            You open tabs to think. You keep them open because you don&apos;t
            want to lose the spark. Stashr gives those tabs a home - organizing
            them into visual Boards you can share, shape, and evolve into real
            projects.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto my-16 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-primary/5 dark:bg-primary/3 flex flex-col items-center rounded-lg p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <LinkMinimalistic className="text-primary size-8" />
            </div>
            <h3 className="font-display mb-2 text-xl font-semibold md:text-2xl">
              Collect
            </h3>
            <p className="text-muted-foreground text-sm">
              Move open tabs and research links into Stashr so nothing is lost
              or left unfinished.
            </p>
          </div>

          <div className="bg-primary/5 dark:bg-primary/3 flex flex-col items-center rounded-lg p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <User className="text-primary size-8" />
            </div>
            <h3 className="font-display mb-2 text-xl font-semibold md:text-2xl">
              Organize
            </h3>
            <p className="text-muted-foreground text-sm">
              Sort your saved links into Boards and categories that reflect how
              you think.
            </p>
          </div>

          <div className="bg-primary/5 dark:bg-primary/3 flex flex-col items-center rounded-lg p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Lightning className="text-primary size-8" />
            </div>
            <h3 className="font-display mb-2 text-xl font-semibold md:text-2xl">
              Collaborate
            </h3>
            <p className="text-muted-foreground text-sm">
              Share a Board with your team and build clarity together before
              committing to a plan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
