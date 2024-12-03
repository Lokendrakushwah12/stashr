import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ThemeToggle } from "../layouts/theme-toggle";
import { Shell } from "../shell";
const Footer = () => {
  return (
    <footer className="w-full bg-background">
      <Shell>
        <hr className="w-full" />
        <div className="relative flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <Link
              target="_blank"
              rel="noreferrer"
              href="https://github.com/lokendrakushwah12"
              className="p-1"
            >
              <GitHubLogoIcon className="h-5 w-5 text-muted-foreground hover:text-secondary-foreground" />
            </Link>
            <ThemeToggle />
            {/* <Link href="#" className="p-1">
              <TwitterLogoIcon className="h-5 w-5 text-muted-foreground hover:text-secondary-foreground" />
            </Link>
            <Link href="#" className="p-1">
              <DiscordLogoIcon className="h-5 w-5 text-muted-foreground hover:text-secondary-foreground" />
            </Link> */}
          </div>
        </div>
      </Shell>
    </footer>
  );
};

export default Footer;
