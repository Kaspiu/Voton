"use client";

import Image from "next/image";
import { ImageUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCoverImage } from "@/hooks/use-cover-image";
import { updatePage } from "@/lib/database/pages";
import { Page } from "@/lib/database/types";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  initialData: Page;
}

export const CoverImage = ({ initialData }: CoverImageProps) => {
  const onChange = useCoverImage((state) => state.onOpen);

  // Removes the cover image from the page.
  const onRemove = () => {
    updatePage(initialData.id, {
      coverImage: undefined,
    });
  };

  return (
    <div
      className={cn(
        "group relative h-[calc(30vh+62px)] w-full",
        !initialData.coverImage && "h-[calc(15vh+62px)]"
      )}
    >
      {!!initialData.coverImage && (
        <Image
          src={initialData.coverImage}
          alt="Cover"
          fill
          className="object-cover"
        />
      )}
      {!!initialData.coverImage && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-all group-hover:opacity-100 max-md:opacity-100">
          <Button
            onClick={onChange}
            variant="outline"
            size="sm"
            className="text-xs text-muted-foreground cursor-pointer dark:bg-[#292929] dark:hover:bg-[#303030]"
          >
            <ImageUp className="h-4 w-4" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            variant="outline"
            size="sm"
            className="text-xs text-muted-foreground cursor-pointer dark:bg-[#292929] dark:hover:bg-[#303030]"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
