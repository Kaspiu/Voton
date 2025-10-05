"use client";

import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { getAllPages } from "@/lib/database/pages";
import { Page } from "@/lib/database/types";

export const SearchCommand = () => {
  const router = useRouter();
  const { isOpen, onClose, toggle } = useSearch();
  const [pages, setPages] = useState<Page[]>([]);

  // Fetches pages on mount and listens for page changes.
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setPages(await getAllPages());
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
  }, []);

  // Adds a keyboard shortcut (Ctrl/Cmd + K) to toggle the search command.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Navigates to the selected page and closes the search command.
  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Search your workspace..." />
      <CommandList>
        <CommandGroup heading="Documents">
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
