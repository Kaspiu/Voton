"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex h-screen w-full shrink-0 flex-col items-center justify-center truncate text-center">
      <Image
        className="dark:hidden"
        src="/error.png"
        width="300"
        height="150"
        alt="Logo"
      />
      <Image
        className="hidden dark:block"
        src="/error-dark.png"
        width="300"
        height="150"
        alt="Logo"
      />
      <h1 className="text-2xl font-bold">Ooops!</h1>
      <h3 className="text-lg font-medium">
        Looks like you&apos;re in the wrong place.
      </h3>
      <Button asChild className="mt-4 cursor-pointer" size="lg">
        <Link href="/documents">Go back</Link>
      </Button>
    </div>
  );
};

export default NotFound;
