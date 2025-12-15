import { XLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Button } from "../ui/button";

const Footer = () => {
  return (
    <footer className="bg-background mx-auto w-full space-y-4 border-t border-dashed py-4">
      {/* <hr className="w-full" /> */}
      <div className="relative mx-auto flex w-full max-w-[86rem] items-center justify-between px-5">
        <p className="text-muted-foreground text-sm font-[400]">
          Built by&nbsp;
          <Link
            target="_blank"
            rel="noreferrer"
            href="https://x.com/lokendratwt"
            className="text-muted-foreground hover:text-secondary-foreground font-[500]"
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
