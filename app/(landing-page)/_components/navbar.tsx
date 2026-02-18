"use client";

import { Github, LogIn } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import { cn } from "@/lib/utils";

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
    <nav
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between bg-background p-6 text-primary transition-all duration-200 dark:bg-[#1F1F1F]",
        scrolled && "border-b py-3",
      )}
    >
      <GithubButton className="hidden max-sm:flex" />

      <Link href="/" className="select-none max-sm:hidden">
        <Logo />
      </Link>

      <div className="flex items-center justify-center gap-6">
        <Button asChild size="lg" className="cursor-pointer">
          <Link href="/documents">
            Open Voton
            <LogIn />
          </Link>
        </Button>

        <GithubButton className="max-sm:hidden" />
      </div>
    </nav>
  );
};

export default Navbar;
