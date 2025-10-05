import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Heading = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-24 max-lg:pb-12">
      <h1 className="max-w-1/2 text-center text-6xl font-bold max-lg:max-w-3/4 max-lg:text-4xl max-sm:max-w-9/10">
        Unite your notes, ideas, and projects. Discover Voton.
      </h1>
      <h3 className="max-w-2/5 text-center text-3xl font-medium max-lg:max-w-1/2 max-lg:text-2xl max-sm:max-w-3/4">
        Voton is your personal, secure universe of notes, where ideas grow
        faster.
      </h3>
      <Button
        className="group h-11 cursor-pointer text-lg max-lg:h-10 max-lg:text-base"
        size="lg"
        asChild
      >
        <Link href="/documents">
          Explore Voton Now
          <ArrowRight className="h-5! w-5! -rotate-45 transition-all duration-300 group-hover:rotate-0" />
        </Link>
      </Button>
    </div>
  );
};

export default Heading;
