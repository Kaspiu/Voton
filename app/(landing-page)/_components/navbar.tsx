"use client";

import Link from "next/link";
import { Github, LogIn } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollNav } from "@/hooks/use-scroll-nav";

const GithubButton = ({ className }: { className?: string }) => {
  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      className={cn("cursor-pointer", className)}
    >
      <Link href="https://github.com/Kaspiu" target="_blank">
        <Github className="h-5! w-5!" />
      </Link>
    </Button>
  );
};

const Navbar = () => {
  const scrolled = useScrollNav();

  return (
    <div
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between bg-background p-6 text-primary transition-all duration-300 cursor-default",
        scrolled && "shadow-md rounded-b-md"
      )}
    >
      <GithubButton className="hidden max-sm:flex" />

      <Logo className="max-sm:hidden" />

      <div className="flex items-center justify-center gap-6">
        <Button asChild size="lg" className="cursor-pointer">
          <Link href="/documents">
            Open Voton
            <LogIn />
          </Link>
        </Button>

        <GithubButton className="max-sm:hidden" />
      </div>
    </div>
  );
};

export default Navbar;
