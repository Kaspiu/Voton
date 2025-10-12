"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageSelect?: (base64Url: string) => void;
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelect,
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handles file drop events, validates files, and triggers the onImageSelect callback.
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorCode = rejection.errors[0]?.code;

        switch (errorCode) {
          case "file-too-large":
            toast.error("File size must be less than 10MB.");
            break;
          case "file-invalid-type":
            toast.error("Only JPEG, PNG, and GIF files are allowed.");
            break;
          case "too-many-files":
            toast.error("Only one file is allowed.");
            break;
          default:
            toast.error("Invalid file.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        if (onImageSelect) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Url = reader.result as string;
            onImageSelect(base64Url);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/gif": [".gif"],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 1,
      multiple: false,
    });

  // Revokes the object URL to prevent memory leaks when the component unmounts or the preview URL changes.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={cn(className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer overflow-hidden p-6 rounded-lg text-center transition-all",
          isDragActive &&
            !isDragReject &&
            "border-muted-foreground bg-secondary",
          isDragReject && "bg-red-50 border-red-500",
          !isDragActive && !isDragReject && "hover:border-muted-foreground",
          previewUrl && "border-1 border-solid p-0"
        )}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            height={500}
            width={500}
            className="h-auto object-contain w-full"
          />
        ) : (
          <div className="flex flex-col gap-2 items-center justify-center">
            <Upload className="h-6 text-primary w-6" />
            <div>
              <p className="font-semibold text-primary text-sm">
                {isDragActive
                  ? "Drop image here"
                  : "Drop image here or click to browse"}
              </p>
              <p className="text-muted-foreground text-xs">
                JPEG, PNG, GIF up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
