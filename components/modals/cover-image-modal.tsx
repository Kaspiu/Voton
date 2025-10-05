"use client";

import { ImageDropzone } from "@/components/dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCoverImage } from "@/hooks/use-cover-image";
import { updatePage } from "@/lib/database/pages";
import { Page } from "@/lib/database/types";

interface CoverImageModalProps {
  initialData: Page;
}

export const CoverImageModal = ({ initialData }: CoverImageModalProps) => {
  const { isOpen, onClose } = useCoverImage();

  // Handles the selection of a new cover image file from the dropzone.
  const onImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);

    updatePage(initialData.id, {
      coverImage: url,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Cover Image</DialogTitle>
        </DialogHeader>
        <ImageDropzone onImageSelect={onImageSelect} />
      </DialogContent>
    </Dialog>
  );
};
