"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  LucideIcon,
  Pen,
  Plus,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteModal } from "@/components/modals/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addPage,
  deletePageWithChildren,
  updatePage,
} from "@/lib/database/pages";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  id?: string;
  documentIcon?: string;
  isActive?: boolean;
  onExpand?: () => void;
  isExpanded?: boolean;
  expandLevel?: number;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  isSearch?: boolean;
}

export const SidebarItem = ({
  id,
  documentIcon,
  isActive,
  onExpand,
  isExpanded,
  expandLevel = 0,
  onClick,
  icon: Icon,
  label,
  isSearch,
}: SidebarItemProps) => {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
  const router = useRouter();
  const params = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(label || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  // Enables the input field for renaming the item.
  const enableInput = () => {
    setTitle(label);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, label.length);
    }, 100);
  };

  // Disables the input field.
  const disableInput = () => {
    setIsEditing(false);
  };

  // Handles the change event for the title input.
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!id) return;
    updatePage(id, {
      title: e.target.value || "Untitled",
    });
  };

  // Handles the "Enter" key press to confirm renaming.
  const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      disableInput();
    }
  };

  // Handles the expansion and collapse of the sidebar item.
  const handleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
    }
  };

  // Creates a new page as a child of the current document.
  const onCreate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!id) return;

    const promise = addPage({
      title: "Untitled",
      parentDocument: id,
    }).then((page) => {
      if (!isExpanded) {
        onExpand?.();
      }
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

  // Deletes the current page and its children.
  const onDelete = () => {
    if (!id) return;

    const promise = deletePageWithChildren(id);

    if (params.documentId === id) {
      router.push(`/documents`);
    }

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        "group flex cursor-pointer items-center rounded-e-md p-1 text-sm font-medium transition-all hover:bg-muted-foreground/10",
        isActive && "bg-muted-foreground/10 text-primary"
      )}
    >
      {!!id && (
        <div
          onClick={handleExpand}
          role="button"
          style={{
            marginLeft: expandLevel ? `${expandLevel * 18 + 18}px` : "18px",
          }}
          className="flex cursor-pointer items-center justify-center rounded-md p-0.5 transition-all hover:bg-muted-foreground/15"
        >
          <ChevronIcon className="h-4 w-4 shrink-0" />
        </div>
      )}

      {documentIcon ? (
        <div className="shrink-0 mx-2">{documentIcon}</div>
      ) : (
        <Icon className={cn("mr-2 ml-4.5 h-4 w-4 shrink-0", !!id && "ml-2")} />
      )}

      {!!id && isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={onChange}
          onBlur={disableInput}
          onKeyDown={onEnterKeyDown}
          className="mr-2 w-full truncate bg-transparent focus:outline-none"
        />
      ) : (
        <span className="truncate">{label}</span>
      )}

      {isSearch && (
        <kbd className="pointer-events-none ml-auto mr-2 flex h-5 select-none items-center justify-center gap-1 rounded-sm border border-muted-foreground/10 bg-secondary px-2 text-xs font-medium">
          <span>Ctrl</span>K
        </kbd>
      )}

      {!!id && (
        <div className="ml-auto mr-2 flex items-center justify-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
              <div
                role="button"
                className="max-md:opacity-100 flex cursor-pointer items-center justify-center rounded-md p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted-foreground/15"
              >
                <Ellipsis className="h-4 w-4 shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              forceMount
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem>
                <DeleteModal onDelete={onDelete}>
                  <div className="flex items-center gap-2">
                    <Trash className="h-4 w-4 shrink-0" />
                    Delete
                  </div>
                </DeleteModal>
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={enableInput}>
                <Pen className="h-4 w-4 shrink-0" />
                Rename
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            onClick={onCreate}
            role="button"
            className="max-md:opacity-100 flex cursor-pointer items-center justify-center rounded-md p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted-foreground/15"
          >
            <Plus className="h-4 w-4 shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
};
