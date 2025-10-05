"use client";

import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { addPage } from "@/lib/database/pages";

const DocumentsPage = () => {
  const router = useRouter();

  // Handles the creation of a new page.
  const onCreate = () => {
    const promise = addPage({
      title: "Untitled",
    }).then((page) => {
      if (page) {
        router.push(`/documents/${page.id}`);
      }
    });

    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create a new page.",
    });
  };

  return (
    <div className="flex h-screen shrink-0 flex-col items-center justify-center truncate text-center">
      <Image src="/logo.svg" width="100" height="100" alt="Logo" />

      <h1 className="text-2xl font-bold">Welcome to Voton!</h1>

      <h3 className="text-lg font-medium">What's on your mind today?</h3>

      <Button onClick={onCreate} className="cursor-pointer mt-4" size="lg">
        <CirclePlus />
        Create a Note
      </Button>
    </div>
  );
};

export default DocumentsPage;
