import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="container flex flex-col items-center gap-2 text-center text-foreground">
      <div className="flex w-full max-w-md flex-col gap-8">
        <p className="text-wrap text-base text-muted-foreground">
          Create a beautiful Twitter receipt for your X account.
        </p>
        <div className="flex w-full flex-col items-start justify-start space-y-2">
          <Label htmlFor="input-01">Twitter username</Label>
          <Input id="input-01" placeholder="username" type="text" />
        </div>
        <Button size="lg">Generate</Button>
      </div>
    </section>
  );
};

export default Hero;
