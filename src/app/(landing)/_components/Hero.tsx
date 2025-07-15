"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StashrLogo } from "@/components/ui/icons";
import { Bookmark, FolderClosed, Plus, RefreshCw } from 'lucide-react';
import Link from "next/link";

const Hero = () => {
  return (
    <section className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <StashrLogo width={80} />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Organize Your Bookmarks
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stashr helps you organize your web bookmarks into beautiful, colorful folders. 
          Never lose track of your favorite websites again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/signin">
              Get Started
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="text-lg px-8 py-6">
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <FolderClosed className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Organized Folders</CardTitle>
              <CardDescription>
                Create colorful folders to categorize your bookmarks by topic, project, or any way you prefer.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Bookmark className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Smart Bookmarks</CardTitle>
              <CardDescription>
                Automatic favicon detection and URL validation ensure your bookmarks are always accessible.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Easy Management</CardTitle>
              <CardDescription>
                Add, edit, and organize your bookmarks with an intuitive and beautiful interface.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
