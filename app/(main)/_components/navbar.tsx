"use client";

import { useEffect, useState } from "react";
import { Ellipsis, Menu, Trash, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { DeleteModal } from "@/components/modals/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePageWithChildren, getPage } from "@/lib/database/pages";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const params = useParams();

  const [title, setTitle] = useState("");

  // Navigates back to the main documents page.
  const onClose = () => {
    router.push(`/documents`);
  };

  // Deletes the current page.
  const onDelete = () => {
    if (!params.documentId) {
      return;
    }

    const promise = deletePageWithChildren(params.documentId as string);

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });

    router.push(`/documents`);
  };

  // Fetches the current page's title and listens for updates.
  useEffect(() => {
    const fetchPage = async () => {
      if (!params.documentId) return;

      const page = await getPage(params.documentId as string);
      if (page) {
        setTitle(page.title);
      }
    };

    fetchPage();

    window.addEventListener("page-changed", fetchPage);
    return () => window.removeEventListener("page-changed", fetchPage);
  }, [params.documentId]);

  return (
    <>
      <nav className="flex w-full items-center gap-4 bg-background p-4 pt-6">
        {isCollapsed && (
          <div
            onClick={onResetWidth}
            role="button"
            className="h-fit w-fit cursor-pointer rounded-md p-[3px] text-muted-foreground transition-all hover:bg-muted-foreground/10"
          >
            <Menu className="h-6 w-6 shrink-0" />
          </div>
        )}
        <div className="flex w-full items-center justify-between">
          <span className="truncate text-lg font-medium text-primary">
            {title}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                className="h-fit w-fit cursor-pointer rounded-md p-[3px] text-muted-foreground transition-all hover:bg-muted-foreground/10"
              >
                <Ellipsis className="h-6 w-6 shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="left" forceMount>
              <DropdownMenuItem onClick={onClose}>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 shrink-0" />
                  Close
                </div>
              </DropdownMenuItem>
              <DeleteModal onDelete={onDelete}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-2">
                    <Trash className="h-4 w-4 shrink-0" />
                    Delete
                  </div>
                </DropdownMenuItem>
              </DeleteModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
};
