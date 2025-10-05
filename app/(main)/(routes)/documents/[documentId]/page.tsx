"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { notFound, useParams } from "next/navigation";

import { CoverImage } from "@/app/(main)/_components/cover";
import { Toolbar } from "@/app/(main)/_components/toolbar";
import { CoverImageModal } from "@/components/modals/cover-image-modal";
import { Spinner } from "@/components/spinner";
import { getPage, updatePage } from "@/lib/database/pages";
import { Page } from "@/lib/database/types";

const DocumentIdPage = () => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<Page | null>(null);
  const params = useParams();

  // Fetches the page data and manages loading state.
  useEffect(() => {
    const fetchPage = async () => {
      if (!params.documentId) return;

      const pageData = await getPage(params.documentId as string);

      setPage(pageData ?? null);
      setIsLoading(false);
    };

    fetchPage();

    window.addEventListener("page-changed", fetchPage);
    return () => window.removeEventListener("page-changed", fetchPage);
  }, [params.documentId]);

  // Updates the page content in the database.
  const saveToDatabase = (content: string) => {
    if (params.documentId) {
      updatePage(params.documentId as string, {
        content: content,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!page) return notFound();

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
