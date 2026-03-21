"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { File, Folder as FolderIcon } from "lucide-react";

import { SidebarItem } from "@/components/sidebar-item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getChildFolders,
  getChildPages,
  getRootFolders,
  getRootPages,
} from "@/lib/database/documents";
import { Folder, Page } from "@/lib/database/types";
import { cn } from "@/lib/utils";

type DocumentItem = (Page & { type: "page" }) | (Folder & { type: "folder" });

// Loads the expanded state of folders from localStorage, returning an empty object on error.
const loadExpandedState = (): Record<string, boolean> => {
  try {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("sidebar-expanded-folders") || "{}");
  } catch (error) {
    console.error("Failed to load sidebar state:", error);
    return {};
  }
};

// Saves the expanded state of a specific folder to localStorage.
const saveExpandedState = (id: string, isExpanded: boolean): void => {
  try {
    const currentState = JSON.parse(
      localStorage.getItem("sidebar-expanded-folders") || "{}",
    );
    currentState[id] = isExpanded;
    localStorage.setItem(
      "sidebar-expanded-folders",
      JSON.stringify(currentState),
    );
  } catch (error) {
    console.error("Failed to save sidebar state:", error);
  }
};

interface DocumentsListProps {
  parentDocumentId?: string;
  expandLevel?: number;
}

export const DocumentsList = ({
  parentDocumentId,
  expandLevel = 0,
}: DocumentsListProps) => {
  const params = useParams();
  const router = useRouter();

  const paddingLeft = expandLevel ? `${expandLevel * 24 + 18}px` : "18px";

  const [documents, setDocuments] = useState<DocumentItem[] | undefined>(
    undefined,
  );
  const [isExpanded, setIsExpanded] =
    useState<Record<string, boolean>>(loadExpandedState);

  // Toggles the expansion state of a folder in both state and localStorage.
  const onExpand = (id: string) => {
    setIsExpanded((prev) => {
      const newValue = !prev[id];
      saveExpandedState(id, newValue);
      return { ...prev, [id]: newValue };
    });
  };

  // Navigates to the selected page.
  const onRedirect = (id: string) => {
    router.push(`/documents/${id}`);
  };

  // Fetches documents and re-fetches whenever workspace items change or are deleted.
  useEffect(() => {
    const fetchPages = async () => {
      try {
        let fetchedPages: Page[] = [];
        let fetchedFolders: Folder[] = [];

        if (parentDocumentId) {
          fetchedPages = await getChildPages(parentDocumentId);
          fetchedFolders = await getChildFolders(parentDocumentId);
        } else {
          fetchedPages = await getRootPages();
          fetchedFolders = await getRootFolders();
        }

        setDocuments([
          ...fetchedFolders.map((f) => ({ ...f, type: "folder" as const })),
          ...fetchedPages.map((p) => ({ ...p, type: "page" as const })),
        ]);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
    };

    fetchPages();

    window.addEventListener("item-changed", fetchPages);
    window.addEventListener("item-deleted", fetchPages);

    return () => {
      window.removeEventListener("item-changed", fetchPages);
      window.removeEventListener("item-deleted", fetchPages);
    };
  }, [parentDocumentId]);

  if (documents === undefined) {
    return (
      <>
        {expandLevel === 0 ? (
          <div className="py-2">
            <div style={{ paddingLeft }} className="mb-3 flex gap-2">
              <Skeleton className="h-4 w-10 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>

            <div style={{ paddingLeft }} className="flex gap-2">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
          </div>
        ) : (
          <div style={{ paddingLeft }} className="flex gap-2 py-1">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded-sm" />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{ paddingLeft }}
        className={cn(
          "hidden truncate pr-3 text-sm font-medium text-muted-foreground/50",
          expandLevel === 0 && "hidden",
          expandLevel > 0 && "last:block",
        )}
      >
        No documents inside
      </p>

      {documents.map((doc) => (
        <div key={doc.id}>
          <SidebarItem
            id={doc.id}
            parentId={doc.parentFolder}
            label={doc.title}
            icon={doc.type === "folder" ? FolderIcon : File}
            documentIcon={doc.type === "page" ? doc.icon : undefined}
            color={doc.type === "folder" ? doc.color : undefined}
            isActive={params.documentId === doc.id}
            isExpanded={isExpanded[doc.id]}
            expandLevel={expandLevel}
            onClick={
              doc.type === "page"
                ? () => onRedirect(doc.id)
                : () => onExpand(doc.id)
            }
            onExpand={() => onExpand(doc.id)}
            type={doc.type}
          />

          {isExpanded[doc.id] && (
            <DocumentsList
              parentDocumentId={doc.id}
              expandLevel={expandLevel + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};
