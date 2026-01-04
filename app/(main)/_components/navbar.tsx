"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Ellipsis, Menu, Trash, X } from "lucide-react";
import { toast } from "sonner";

import { DeleteModal } from "@/components/modals/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deletePage, getPage } from "@/lib/database/pages";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

// Formats timestamp into relative time string
const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes <= 1) return "Edited just now";
  if (minutes < 60) return `Edited ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Edited ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Edited ${days}d ago`;

  const months = Math.floor(days / 30);
  if (days < 365) return `Edited ${months}mo ago`;

  const years = Math.floor(days / 365);
  return `Edited ${years}y ago`;
};

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const params = useParams();

  const [title, setTitle] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number>();
  const [formattedTime, setFormattedTime] = useState("");

  // Navigates back to the main documents page.
  const onClose = () => {
    router.push(`/documents`);
  };

  // Deletes the current page.
  const onDelete = () => {
    if (!params.documentId) {
      return;
    }

    const promise = deletePage(params.documentId as string);

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });

    promise.then(() => router.push(`/documents`));
  };

  // Fetches page data and listens for changes
  useEffect(() => {
    const fetchPage = async () => {
      if (!params.documentId) return;

      const page = await getPage(params.documentId as string);
      if (page) {
        setTitle(page.title);
        setUpdatedAt(page.updatedAt);
        setFormattedTime(page.updatedAt ? formatTimeAgo(page.updatedAt) : "");
      }
    };

    fetchPage();

    window.addEventListener("item-changed", fetchPage);

    return () => window.removeEventListener("item-changed", fetchPage);
  }, [params.documentId]);

  return (
    <>
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
        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
          <span className="truncate text-lg font-medium text-muted-foreground">
            {title}
          </span>

          <div className="flex items-center justify-center gap-2">
            {updatedAt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-fit w-fit rounded-md p-1 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <span>{formattedTime}</span>
                </TooltipContent>
              </Tooltip>
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

                <DropdownMenuItem variant="destructive">
                  <DeleteModal onDelete={onDelete}>
                    <div className="flex items-center gap-2">
                      <Trash className="h-4 w-4 shrink-0 text-destructive" />
                      Delete
                    </div>
                  </DeleteModal>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
};
