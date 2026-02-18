"use client";

import { File } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { getAllPages } from "@/lib/database/documents";
import { Page } from "@/lib/database/types";

const SEARCH_SHORTCUT_KEY = "k";

export const SearchCommand = () => {
  const router = useRouter();
  const { isOpen, onClose, toggle } = useSearch();
  const [pages, setPages] = useState<Page[]>([]);

  // Fetches all pages and re-fetches whenever workspace items change or are deleted.
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setPages(await getAllPages());
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
  }, []);

  // Registers the Ctrl/Cmd+K keyboard shortcut to open or close the search palette.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SEARCH_SHORTCUT_KEY && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Navigates to the selected page and closes the search palette.
  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Search your workspace..." />
      <CommandList>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.id}
              title={page.title}
              onSelect={() => onSelect(page.id)}
              value={`${page.id}-${page.title}`}
            >
              {page.icon ? (
                <div>{page.icon}</div>
              ) : (
                <File className="h-4 w-4" />
              )}
              <span className="font-medium">{page.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </CommandDialog>
  );
};
