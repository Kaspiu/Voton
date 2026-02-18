"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const ERROR_IMAGE_SRC = "/error.png";
const ERROR_IMAGE_SRC_DARK = "/error-dark.png";
const ERROR_IMAGE_WIDTH = 300;
const ERROR_IMAGE_HEIGHT = 150;

const NotFound = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center truncate text-center">
      <Image
        src={ERROR_IMAGE_SRC}
        width={ERROR_IMAGE_WIDTH}
        height={ERROR_IMAGE_HEIGHT}
        alt="Page not found illustration"
        className="dark:hidden"
      />
      <Image
        src={ERROR_IMAGE_SRC_DARK}
        width={ERROR_IMAGE_WIDTH}
        height={ERROR_IMAGE_HEIGHT}
        alt="Page not found illustration"
        className="hidden dark:block"
      />
      <h1 className="text-2xl font-bold">Ooops!</h1>
      <h3 className="text-lg font-medium">
        Looks like you&apos;re in the wrong place.
      </h3>
      <Button asChild size="lg" className="mt-4 cursor-pointer">
        <Link href="/">Go back</Link>
      </Button>
    </div>
  );
};

export default NotFound;
