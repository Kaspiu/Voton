// eslint-disable react-hooks/exhaustive-deps
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronsLeft,
  CirclePlus,
  File,
  Folder,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

import { Logo } from "@/components/logo";
import { SidebarItem } from "@/components/sidebar-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useSidebar } from "@/hooks/use-sidebar";
import { addFolder, addPage, getPage } from "@/lib/database/documents";
import { cn } from "@/lib/utils";

import { DocumentsList } from "./documents-list";
import { Navbar } from "./navbar";

const DEFAULT_SIDEBAR_WIDTH = 288;
const MIN_SIDEBAR_WIDTH = 288;
const MAX_SIDEBAR_WIDTH = 448;

const SIDEBAR_TOGGLE_KEY = "\\";
const NEW_PAGE_KEY = "p";

const Navigation = () => {
  const pathName = usePathname();
  const params = useParams();
  const documentId = params.documentId as string | undefined;
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const onSearchOpen = useSearch((state) => state.onOpen);
  const onSettingsOpen = useSettings((state) => state.onOpen);
  const isCollapsed = useSidebar((state) => state.isCollapsed);
  const onCollapse = useSidebar((state) => state.onCollapse);
  const onExpand = useSidebar((state) => state.onExpand);

  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isDocumentFound, setIsDocumentFound] = useState(true);

  // Collapses the sidebar to zero width and expands the navbar to full width.
  const collapseSidebar = () => {
    if (sidebarRef.current && navbarRef.current) {
      onCollapse();
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.left = "0";
      navbarRef.current.style.width = "100%";

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  // Resets the sidebar to its default or saved width.
  const resetSidebarWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      onExpand();
      setIsResetting(true);

      const width = isMobile ? "100%" : `${DEFAULT_SIDEBAR_WIDTH}px`;
      const navLeft = isMobile ? "100%" : `${DEFAULT_SIDEBAR_WIDTH}px`;
      const navWidth = isMobile
        ? "0"
        : `calc(100% - ${DEFAULT_SIDEBAR_WIDTH}px)`;

      sidebarRef.current.style.width = width;
      navbarRef.current.style.left = navLeft;
      navbarRef.current.style.width = navWidth;

      if (!isMobile) {
        localStorage.setItem("sidebar-width", String(DEFAULT_SIDEBAR_WIDTH));
      }

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  // Handles mouse movement during sidebar resize, clamping width between min and max.
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    let newWidth = e.clientX;
    if (newWidth < MIN_SIDEBAR_WIDTH) newWidth = MIN_SIDEBAR_WIDTH;
    if (newWidth > MAX_SIDEBAR_WIDTH) newWidth = MAX_SIDEBAR_WIDTH;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.left = `${newWidth}px`;
      navbarRef.current.style.width = `calc(100% - ${newWidth}px)`;
    }
  };

  // Stops the resize operation and saves the final sidebar width to localStorage.
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (sidebarRef.current && sidebarRef.current.style.width) {
      localStorage.setItem(
        "sidebar-width",
        sidebarRef.current.style.width.replace("px", ""),
      );
    }
  };

  // Initiates the sidebar resize operation.
  const handleSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Creates a new untitled page and navigates to it.
  const onCreatePage = () => {
    const promise = addPage({ title: "Untitled" }).then((page) => {
      if (page) router.push(`/documents/${page.id}`);
    });

    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create a new page.",
    });
  };

  // Creates a new folder.
  const onCreateFolder = () => {
    const promise = addFolder({ title: "New folder" });

    toast.promise(promise, {
      loading: "Creating a new folder...",
      success: "New folder created!",
      error: "Failed to create a new folder.",
    });
  };

  // Restores saved sidebar width on desktop, collapses on mobile.
  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    } else {
      const savedWidth = localStorage.getItem("sidebar-width");
      if (savedWidth && sidebarRef.current && navbarRef.current) {
        onExpand();
        sidebarRef.current.style.width = `${savedWidth}px`;
        navbarRef.current.style.left = `${savedWidth}px`;
        navbarRef.current.style.width = `calc(100% - ${savedWidth}px)`;
      } else {
        resetSidebarWidth();
      }
    }
  }, [isMobile]);

  // Collapses sidebar on mobile when route changes.
  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    }
  }, [isMobile, pathName]);

  // Checks if the current document exists to determine navbar visibility.
  useEffect(() => {
    const checkDocument = async () => {
      setIsDocumentFound(true);
      if (documentId) {
        const page = await getPage(documentId);
        setIsDocumentFound(!!page);
      }
    };
    checkDocument();
  }, [documentId]);

  // Register global keyboard shortcuts for sidebar toggle and new page creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === SIDEBAR_TOGGLE_KEY && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isCollapsed) {
          resetSidebarWidth();
        } else {
          collapseSidebar();
        }
      }
      if (e.key === NEW_PAGE_KEY && (e.ctrlKey || e.metaKey) && e.altKey) {
        e.preventDefault();
        onCreatePage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/aside relative z-50 flex h-screen w-72 flex-col overflow-x-hidden overflow-y-auto bg-secondary text-muted-foreground",
          isResetting && "transition-all duration-200",
          isMobile && "w-0",
        )}
      >
        <div className="flex items-center justify-between px-3 pt-4">
          <Link href="/" className="shrink-0 select-none">
            <Logo size="sm" className="text-primary" />
          </Link>
          <div
            onClick={collapseSidebar}
            role="button"
            className="flex cursor-pointer items-center justify-center rounded-md p-[3px] transition-all hover:bg-muted-foreground/10"
          >
            <ChevronsLeft className="h-6 w-6" />
          </div>
        </div>

        <div className="flex w-full flex-col py-4">
          <SidebarItem
            onClick={onSearchOpen}
            icon={Search}
            label="Search"
            isSearch
          />
          <SidebarItem
            onClick={onSettingsOpen}
            icon={Settings}
            label="Settings"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                className="group mx-1 flex cursor-pointer items-center rounded-sm py-1 text-sm font-medium transition-all hover:bg-muted-foreground/10 data-[state=open]:bg-muted-foreground/10"
              >
                <CirclePlus className="ml-3.5 mr-2 h-4 w-4 shrink-0" />
                <span className="mr-2 truncate">Add</span>
                <ChevronRight
                  className={cn(
                    "ml-auto mr-2 h-4 w-4 shrink-0 transition-all",
                    isMobile && "group-data-[state=open]:rotate-90",
                  )}
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isMobile ? "end" : "start"}
              side={isMobile ? "bottom" : "right"}
            >
              <DropdownMenuItem onClick={onCreatePage}>
                <File className="h-4 w-4 shrink-0" /> New page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateFolder}>
                <Folder className="h-4 w-4 shrink-0" /> New folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="pl-4.5 pr-3 text-xs font-bold text-muted-foreground/50">
          Workspace
        </p>

        <div className="truncate overflow-y-auto mt-2 pb-2 doc-list-scroll">
          <DocumentsList />
        </div>

        <div
          onClick={!isMobile ? resetSidebarWidth : undefined}
          onMouseDown={!isMobile ? handleSidebarResize : undefined}
          className="absolute top-0 right-0 h-full w-[3px] cursor-ew-resize bg-muted-foreground/10 opacity-0 transition-all group-hover/aside:opacity-100"
        />
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "fixed top-0 left-72 z-50 w-[calc(100%-288px)]",
          isResetting && "transition-all duration-200",
          isMobile && "left-0 w-full",
        )}
      >
        {documentId && isDocumentFound ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetSidebarWidth} />
        ) : (
          <nav className="w-full p-4 pt-6">
            {isCollapsed && (
              <div
                onClick={resetSidebarWidth}
                role="button"
                className="flex h-fit w-fit cursor-pointer items-center justify-center rounded-md p-[3px] text-muted-foreground transition-all hover:bg-muted-foreground/10"
              >
                <Menu className="h-6 w-6" />
              </div>
            )}
          </nav>
        )}
      </div>
    </>
  );
};

export default Navigation;
