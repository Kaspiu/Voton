"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Ellipsis,
  FilePlus,
  FolderPlus,
  LucideIcon,
  Palette,
  Pen,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  addFolder,
  addPage,
  deleteFolderWithChildren,
  deletePage,
  getFolder,
  getPage,
  updateFolder,
  updatePage,
} from "@/lib/database/documents";
import { DeleteModal } from "@/components/modals/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  color?: string;
  isSearch?: boolean;
  type?: "page" | "folder";
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
  color,
  isSearch,
  type = "page",
}: SidebarItemProps) => {
  const router = useRouter();
  const params = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(label || "Untitled");
  const [isEditing, setIsEditing] = useState(false);
  const shouldBlockRestoreRef = useRef(false);

  // Enables the input field for renaming the item.
  const enableInput = () => {
    shouldBlockRestoreRef.current = true;
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
    shouldBlockRestoreRef.current = false;
  };

  // Handle title input change
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!id) return;

    if (type === "folder") {
      updateFolder(id, {
        title: e.target.value || "Untitled",
      });
    } else {
      updatePage(id, {
        title: e.target.value || "Untitled",
      });
    }
  };

  // Confirm renaming on Enter key
  const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      disableInput();
    }
  };

  // Create a new child page
  const onCreatePage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;

    const promise = addPage({
      title: "Untitled",
      parentFolder: id,
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

  // Create a new child folder
  const onCreateFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;

    const promise = addFolder({
      title: "New folder",
      parentFolder: id,
    }).then(() => {
      if (!isExpanded) {
        onExpand?.();
      }
    });

    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create a new page.",
    });
  };

  // Delete the current item and its children
  const onDelete = async () => {
    if (!id) return;

    let shouldRedirect = false;

    if (params.documentId === id) {
      shouldRedirect = true;
    } else if (type === "folder" && params.documentId) {
      const currentDocId = params.documentId as string;
      const page = await getPage(currentDocId);
      if (page) {
        let parentId = page.parentFolder;
        while (parentId) {
          if (parentId === id) {
            shouldRedirect = true;
            break;
          }
          const parentFolder = await getFolder(parentId);
          parentId = parentFolder?.parentFolder;
        }
      }
    }

    const promise =
      type === "folder" ? deleteFolderWithChildren(id) : deletePage(id);

    toast.promise(promise, {
      loading: "Deleting page...",
      success: "Page deleted!",
      error: "Failed to delete page.",
    });

    if (shouldRedirect) {
      promise.then(() => router.push(`/documents`));
    }
  };

  return (
    <div
      onClick={onClick}
      role="button"
      className={cn(
        "group flex cursor-pointer items-center rounded-sm py-1 mx-1 text-sm font-medium transition-all hover:bg-muted-foreground/10",
        isActive && "bg-muted-foreground/10 text-primary",
      )}
    >
      {!!id && type === "folder" && (
        <ChevronRight
          style={{
            marginLeft: expandLevel ? `${expandLevel * 24 + 18}px` : "18px",
          }}
          className={cn(
            "h-4 w-4 shrink-0 transition-all",
            isExpanded && "rotate-90",
          )}
        />
      )}

      {documentIcon ? (
        <div
          style={{
            marginLeft:
              type === "page"
                ? expandLevel
                  ? `${expandLevel * 24 + 18}px`
                  : "18px"
                : undefined,
          }}
          className="shrink-0 mx-2"
        >
          {documentIcon}
        </div>
      ) : (
        <Icon
          style={{
            marginLeft:
              type === "page"
                ? expandLevel
                  ? `${expandLevel * 24 + 18}px`
                  : "18px"
                : undefined,
          }}
          className={cn(
            "mr-2 ml-4.5 h-4 w-4 shrink-0",
            !!id && "ml-2",
            type === "folder" && !!color && `text-${color}-500`,
          )}
        />
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
        <span className="truncate mr-2">{label}</span>
      )}

      {isSearch && (
        <kbd className="pointer-events-none ml-auto mr-2 flex h-5 select-none items-center justify-center gap-1 rounded-sm border border-muted-foreground/10 bg-secondary px-2 text-xs font-medium">
          <span>Ctrl</span>K
        </kbd>
      )}

      {!!id && (
        <div className="ml-auto mr-2 flex items-center justify-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
              <button className="flex cursor-pointer items-center justify-center rounded-sm p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted-foreground/15 data-[state=open]:bg-muted-foreground/15 data-[state=open]:opacity-100 group-focus-within:opacity-100">
                <Ellipsis className="h-4 w-4 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => {
                if (shouldBlockRestoreRef.current) {
                  e.preventDefault();
                }
              }}
            >
              {type === "folder" && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="h-4 w-4 shrink-0" />
                    Colors
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={color || ""}
                        onValueChange={(value) => {
                          if (!id) return;
                          updateFolder(id, { color: value });
                        }}
                      >
                        <DropdownMenuRadioItem value="">
                          Default
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="gray"
                          className="text-gray-500"
                        >
                          Gray
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="red"
                          className="text-red-500"
                        >
                          Red
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="orange"
                          className="text-orange-500"
                        >
                          Orange
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="yellow"
                          className="text-yellow-500"
                        >
                          Yellow
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="green"
                          className="text-green-500"
                        >
                          Green
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="blue"
                          className="text-blue-500"
                        >
                          Blue
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="purple"
                          className="text-purple-500"
                        >
                          Purple
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="pink"
                          className="text-pink-500"
                        >
                          Pink
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}

              <DropdownMenuItem onSelect={enableInput}>
                <Pen className="h-4 w-4 shrink-0" />
                Rename
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

          {type === "folder" && (
            <>
              <button
                onClick={onCreatePage}
                className="flex cursor-pointer items-center justify-center rounded-sm p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted-foreground/15 group-focus-within:opacity-100"
              >
                <FilePlus className="h-4 w-4 shrink-0" />
              </button>
              <button
                onClick={onCreateFolder}
                className="flex cursor-pointer items-center justify-center rounded-sm p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted-foreground/15 group-focus-within:opacity-100"
              >
                <FolderPlus className="h-4 w-4 shrink-0" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
