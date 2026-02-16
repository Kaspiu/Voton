"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { notFound, useParams } from "next/navigation";

import { CoverImage } from "@/app/(main)/_components/cover";
import { Toolbar } from "@/app/(main)/_components/toolbar";
import { CoverImageModal } from "@/components/modals/cover-image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { getPage, updatePage } from "@/lib/database/documents";
import { Page } from "@/lib/database/types";

const DocumentIdPage = () => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const [page, setPage] = useState<Page | null | undefined>(undefined);
  const params = useParams();

  // Fetches the page data and manages loading state.
  useEffect(() => {
    const fetchPage = async () => {
      if (!params.documentId) return;

      const pageData = await getPage(params.documentId as string);

      setPage(pageData ?? null);
    };

    fetchPage();

    window.addEventListener("item-changed", fetchPage);

    return () => window.removeEventListener("item-changed", fetchPage);
  }, [params.documentId]);

  // Updates the page content in the database.
  const saveToDatabase = (content: string) => {
    if (params.documentId) {
      updatePage(params.documentId as string, {
        content: content,
      });
    }
  };

  if (page === undefined) {
    return (
      <div className="mt-[62px]">
        <Skeleton className="h-[15vh] w-full" />
        <div className="max-w-5xl space-y-4 pl-16 mt-14">
          <Skeleton className="mt-20 mb-14 h-14 w-1/3" />
          <Skeleton className="h-5 w-3/4 rounded-sm" />
          <Skeleton className="h-5 w-2/5 rounded-sm" />
          <Skeleton className="h-5 w-3/5 rounded-sm" />
          <Skeleton className="h-5 w-1/2 rounded-sm" />
        </div>
      </div>
    );
  }

  if (page === null) return notFound();

  return (
    <div className="pb-40">
      <CoverImage initialData={page} />
      <Toolbar initialData={page} />
      <Editor onChange={saveToDatabase} initialData={page.content} />
      <CoverImageModal initialData={page} />
    </div>
  );
};

export default DocumentIdPage;
