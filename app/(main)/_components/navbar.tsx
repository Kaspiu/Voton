"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Ellipsis, Menu, Trash, X } from "lucide-react";
import { toast } from "sonner";

import { DeleteModal } from "@/components/modals/delete-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePage, getPage } from "@/lib/database/documents";

const MS_PER_MINUTE = 60000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

// Formats a timestamp into a relative time string.
const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / MS_PER_MINUTE);

  if (minutes <= 1) return "Edited just now";
  if (minutes < 60) return `Edited ${minutes}m ago`;

  const hours = Math.floor(diff / MS_PER_HOUR);
  if (hours < 24) return `Edited ${hours}h ago`;

  const days = Math.floor(diff / MS_PER_DAY);
  if (days < 30) return `Edited ${days}d ago`;

  const months = Math.floor(diff / MS_PER_MONTH);
  if (days < 365) return `Edited ${months}mo ago`;

  const years = Math.floor(diff / MS_PER_YEAR);
  return `Edited ${years}y ago`;
};

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;

  const [title, setTitle] = useState<string | undefined>(undefined);
  const [updatedAt, setUpdatedAt] = useState<number>();
  const [formattedTime, setFormattedTime] = useState("");

  // Navigates back to the main documents page.
  const onClose = () => {
    router.push("/documents");
  };

  // Deletes the current page and navigates back to the documents list.
  const onDelete = () => {
    if (!documentId) return;

    const promise = deletePage(documentId);

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });

    promise.then(() => router.push("/documents"));
  };

  // Fetches the page data and re-fetches whenever the page is updated externally.
  useEffect(() => {
    const fetchPage = async () => {
      if (!documentId) return;

      const page = await getPage(documentId);
      if (page) {
        setTitle(page.title);
        setUpdatedAt(page.updatedAt);
        setFormattedTime(page.updatedAt ? formatTimeAgo(page.updatedAt) : "");
      }
    };

    fetchPage();

    window.addEventListener("item-changed", fetchPage);
    return () => window.removeEventListener("item-changed", fetchPage);
  }, [documentId]);

  return (
    <nav className="flex w-full items-center gap-4 bg-background p-4 dark:bg-[#1F1F1F]">
      {isCollapsed && (
        <div
          onClick={onResetWidth}
          role="button"
          className="h-fit w-fit cursor-pointer rounded-md p-[3px] text-muted-foreground transition-all hover:bg-muted-foreground/10"
        >
          <Menu className="h-6 w-6 shrink-0" />
        </div>
      )}
      <div className="flex h-[30px] min-w-0 flex-1 items-center justify-between gap-4">
        {title === undefined ? (
          <Skeleton className="h-6 w-19" />
        ) : (
          <span className="truncate text-lg font-medium text-muted-foreground">
            {title}
          </span>
        )}

        <div className="flex items-center justify-center gap-2">
          {title === undefined ? (
            <Skeleton className="h-6 w-17" />
          ) : (
            <>
              {updatedAt && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      role="button"
                      className="h-fit w-fit cursor-pointer rounded-md p-[7px] text-muted-foreground transition-all hover:bg-muted-foreground/10 data-[state=open]:bg-muted-foreground/10"
                    >
                      <Clock className="h-4 w-4 shrink-0" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    className="flex items-center justify-center text-sm font-medium text-muted-foreground"
                  >
                    <span className="px-2 py-1.5">{formattedTime}</span>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    role="button"
                    className="h-fit w-fit cursor-pointer rounded-md p-[3px] text-muted-foreground transition-all hover:bg-muted-foreground/10 data-[state=open]:bg-muted-foreground/10"
                  >
                    <Ellipsis className="h-6 w-6 shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onClose}>
                    <X className="h-4 w-4 shrink-0" />
                    Close
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DeleteModal onDelete={onDelete}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      variant="destructive"
                    >
                      <div className="flex items-center gap-2">
                        <Trash className="h-4 w-4 shrink-0 text-destructive" />
                        Delete
                      </div>
                    </DropdownMenuItem>
                  </DeleteModal>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
