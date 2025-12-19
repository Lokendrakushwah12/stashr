"use client";
import { XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Button } from "../ui/button";
import { StashrLogo } from "../ui/icons";

const Footer = () => {
  const { data: session } = useSession();
  return (
    <footer className="bg-background mx-auto w-full space-y-4">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between border-t border-dashed px-5 py-8">
        <div className="flex flex-col items-start justify-start gap-2">
          <Link
            href={session ? "/board" : "/"}
            className="text-foreground flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <StashrLogo width={24} className="text-primary" />
            <span className="text-base font-medium">Stashr</span>
          </Link>
          <p className="text-muted-foreground max-w-md text-sm font-normal">
            Stash your open tabs, bookmarks, and scattered ideas into one place
            - so you can sort, structure, and collaborate on them.
          </p>
          <p className="text-muted-foreground mt-4 text-xs font-normal">
            Built by&nbsp;
            <Link
              target="_blank"
              rel="noreferrer"
              href="https://x.com/lokendratwt"
              className="text-muted-foreground hover:text-secondary-foreground font-medium"
            >
              Lokendra.
            </Link>
          </p>
        </div>
        <div className="flex items-center">
          <Button
            data-slot="button"
            className="size-9 p-0"
            variant="ghost"
            aria-label="Twitter"
            title="Twitter"
            asChild
          >
            <Link
              target="_blank"
              rel="noreferrer"
              href="https://x.com/lokendratwt"
            >
              <XLogoIcon weight="duotone" className="text-foreground h-5 w-5" />
            </Link>
          </Button>
          <Button
            data-slot="button"
            className="size-9 p-0"
            variant="ghost"
            aria-label="Github"
            title="Github"
            asChild
          >
            <Link
              target="_blank"
              rel="noreferrer"
              href="https://github.com/lokendrakushwah12"
            >
              <GitHubLogoIcon className="text-foreground h-5 w-5" />
            </Link>
          </Button>
          <ThemeToggle className="flex size-9 items-center justify-center px-2.5" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
