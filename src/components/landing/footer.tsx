import { XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Button } from "../ui/button";

const Footer = () => {
  return (
    <footer className="w-full bg-background space-y-4 container pb-4">
      <hr className="w-full" />
      <div className="relative flex items-center w-full justify-between">
        <p className="text-sm font-[400] text-muted-foreground">
          Built by&nbsp;
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://x.com/lokendratwt"
            className="font-[500] text-muted-foreground hover:text-secondary-foreground"
          >
            Lokendra.
          </Link>
        </p>
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
              <XLogoIcon weight="duotone" className="h-5 w-5 text-foreground" />
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
              <GitHubLogoIcon className="h-5 w-5 text-foreground" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
