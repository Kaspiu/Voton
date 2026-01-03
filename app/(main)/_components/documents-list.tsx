"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { File, Folder as FolderIcon } from "lucide-react";

import { SidebarItem } from "@/components/sidebar-item";
import {
  getChildFolders,
  getChildPages,
  getRootFolders,
  getRootPages,
} from "@/lib/database/pages";
import { Folder, Page } from "@/lib/database/types";
import { cn } from "@/lib/utils";

interface DocumentsListProps {
  parentDocumentId?: string;
  expandLevel?: number;
}

type DocumentItem = (Page & { type: "page" }) | (Folder & { type: "folder" });

export const DocumentsList = ({
  parentDocumentId,
  expandLevel = 0,
}: DocumentsListProps) => {
  const params = useParams();
  const router = useRouter();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>(() => {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(
          localStorage.getItem("sidebar-expanded-folders") || "{}"
        );
      }
    } catch (error) {
      console.error("Failed to load sidebar state:", error);
    }
    return {};
  });

  // Toggle expansion state for a document
  const onExpand = (id: string) => {
    setIsExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      const currentState = JSON.parse(
        localStorage.getItem("sidebar-expanded-folders") || "{}"
      );
      currentState[id] = !currentState[id];
      localStorage.setItem(
        "sidebar-expanded-folders",
        JSON.stringify(currentState)
      );
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  };

  // Navigate to the document page
  const onRedirect = (id: string) => {
    router.push(`/documents/${id}`);
  };

  // Fetch documents and set up event listeners for updates
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

  return (
    <>
      <p
        style={{
          paddingLeft: expandLevel ? `${expandLevel * 18 + 22}px` : "22px",
        }}
        className={cn(
          "hidden font-medium pr-1 text-muted-foreground/50 text-sm truncate",
          expandLevel === 0 && "hidden",
          expandLevel > 0 && "last:block"
        )}
      >
        No pages inside
      </p>

      {documents.map((doc) => (
        <div key={doc.id}>
          <SidebarItem
            id={doc.id}
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
