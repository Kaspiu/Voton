"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";

import { SiGithub } from "@icons-pack/react-simple-icons";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useScrollNav } from "@/hooks/use-scroll-nav";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const scrolled = useScrollNav();

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 flex w-full items-center justify-between bg-background p-6 text-primary transition-all duration-200 dark:bg-[#1F1F1F]",
        scrolled && "border-b py-3",
      )}
    >
      <Link href="/" className="select-none">
        <Logo />
      </Link>

      <div className="flex items-center justify-center gap-6 max-sm:gap-3">
        <Button asChild size="lg" className="cursor-pointer">
          <Link href="/documents">
            <span className="flex max-sm:hidden">Open Voton</span>
            <span className="hidden max-sm:flex">Open</span>
            <LogIn />
          </Link>
        </Button>

        <Button asChild size="lg" variant="outline" className="cursor-pointer">
          <Link href="https://github.com/Kaspiu/Voton" target="_blank">
            <SiGithub className="h-5! w-5!" />
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
