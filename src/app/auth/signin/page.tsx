"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StashrLogo } from "@/components/ui/icons";
import { Loader } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      void router.push("/");
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 md:px-0">
      <Card className="hidden h-[calc(100vh-1rem)] w-full max-w-1/2 flex-col justify-center overflow-hidden rounded-2xl lg:flex">
        <div className="relative">
          <div className="from-card pointer-events-none absolute -bottom-[410px] z-30 h-60 w-full bg-linear-to-t to-transparent dark:from-[#101010]" />
          <div className="border-border/50 absolute -top-80 left-8 aspect-video overflow-clip rounded-sm border border-b-0 bg-[#fff] select-none lg:rounded-t-lg dark:bg-[#09090b]">
            <img
              src="/og.png"
              alt="Stashr Dashboard Preview"
              className="hidden h-[180%] w-full object-cover object-left dark:block"
              width={1200}
              height={630}
            />
            <img
              src="/og-light.png"
              alt="Stashr Dashboard Preview"
              className="block h-[180%] w-full object-cover object-left dark:hidden"
              width={1200}
              height={630}
            />
          </div>
        </div>
      </Card>
      <div className="flex h-[calc(100vh-1rem)] w-full max-w-1/2 flex-col items-center justify-center gap-6 rounded-2xl">
        <div className="flex justify-center">
          <Link href="/">
            <StashrLogo width={48} className="text-primary" />
          </Link>
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl">Welcome to Stashr</h1>
          <p className="text-muted-foreground">
            Sign in to organize your bookmarks
          </p>
        </div>
        <Button onClick={handleGoogleSignIn} size="sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#fff"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#fff"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#fff"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#fff"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
