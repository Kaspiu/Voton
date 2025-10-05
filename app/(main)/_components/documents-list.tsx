"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { File } from "lucide-react";

import { SidebarItem } from "@/components/sidebar-item";
import { getChildPages, getRootPages } from "@/lib/database/pages"; // I've noticed a potential error here. See the error list below.
import { Page } from "@/lib/database/types";
import { cn } from "@/lib/utils";

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

  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [pages, setPages] = useState<Page[]>([]);

  // Toggles the expanded state for a given document ID.
  const onExpand = (id: string) => {
    setIsExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Navigates to the page for the given document ID.
  const onRedirect = (id: string) => {
    router.push(`/documents/${id}`);
  };

  // Fetches and updates the list of pages based on parent ID and events.
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pagesToFetch = parentDocumentId
          ? getChildPages(parentDocumentId)
          : getRootPages();
        setPages(await pagesToFetch);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
    };

    fetchPages();

    window.addEventListener("page-changed", fetchPages);
    window.addEventListener("page-deleted", fetchPages);
    return () => {
      window.removeEventListener("page-changed", fetchPages);
      window.removeEventListener("page-deleted", fetchPages);
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

      {pages.map((page) => (
        <div key={page.id}>
          <SidebarItem
            id={page.id}
            label={page.title}
            icon={File}
            documentIcon={page.icon}
            isActive={params.documentId === page.id}
            isExpanded={isExpanded[page.id]}
            expandLevel={expandLevel}
            onClick={() => onRedirect(page.id)}
            onExpand={() => onExpand(page.id)}
          />

          {isExpanded[page.id] && (
            <DocumentsList
              parentDocumentId={page.id}
              expandLevel={expandLevel + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};
