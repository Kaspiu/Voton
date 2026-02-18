"use client";

import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addPage } from "@/lib/database/documents";

const LOGO_SRC = "/logo.svg";
const LOGO_SRC_DARK = "/logo-dark.svg";
const LOGO_SIZE = 100;

const DocumentsPage = () => {
  const router = useRouter();

  // Creates a new untitled page, navigates to it on success, and shows a toast for each state.
  const onCreate = () => {
    const promise = addPage({ title: "Untitled" }).then((page) => {
      if (page) router.push(`/documents/${page.id}`);
    });

    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create a new page.",
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center truncate text-center">
      <Image
        src={LOGO_SRC}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        alt="Logo"
        className="dark:hidden"
      />
      <Image
        src={LOGO_SRC_DARK}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        alt="Logo"
        className="hidden dark:block"
      />

      <h1 className="text-2xl font-bold">Welcome to Voton!</h1>
      <h3 className="text-lg font-medium">What&apos;s on your mind today?</h3>

      <Button onClick={onCreate} size="lg" className="mt-4 cursor-pointer">
        <CirclePlus />
        Create a page
      </Button>
    </div>
  );
};

export default DocumentsPage;
