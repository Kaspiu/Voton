"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronsLeft, CirclePlus, Menu, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { addPage } from "@/lib/database/pages";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { SidebarItem } from "@/components/sidebar-item";
import { DocumentsList } from "./documents-list";
import { Navbar } from "./navbar";

const Navigation = () => {
  const pathName = usePathname();
  const params = useParams();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const onSearchOpen = useSearch((state) => state.onOpen);
  const onSettingsOpen = useSettings((state) => state.onOpen);

  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [isResetting, setIsResetting] = useState(false);

  // Collapses the sidebar to a zero-width state.
  const collapseSidebar = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.left = "0";
      navbarRef.current.style.width = "100%";

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  // Resets the sidebar to its default or mobile-specific width.
  const resetSidebarWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.left = isMobile ? "100%" : "240px";
      navbarRef.current.style.width = isMobile ? "0" : "calc(100% - 240px)";

      setTimeout(() => setIsResetting(false), 300);
    }
  };

  // Handles the mouse move event to resize the sidebar.
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    let newWidth = e.clientX;
    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.left = `${newWidth}px`;
      navbarRef.current.style.width = `calc(100% - ${newWidth}px)`;
    }
  };

  // Handles the mouse up event to stop resizing the sidebar.
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Handles the mouse down event to start resizing the sidebar.
  const handleSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Creates a new page and navigates to it.
  const onCreate = () => {
    const promise = addPage({ title: "Untitled" }).then((page) => {
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

  // Collapses or resets the sidebar based on the mobile breakpoint.
  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    } else {
      resetSidebarWidth();
    }
  }, [isMobile]);

  // Collapses the sidebar on mobile when the route changes.
  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    }
  }, [isMobile, pathName]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "sticky top-0 left-0 z-50 flex h-screen w-60 flex-col overflow-y-auto bg-secondary text-muted-foreground",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "w-0"
        )}
      >
        <div className="flex items-center justify-between pt-4 pl-4 pr-3">
          <Link href="/" className="shrink-0">
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

        <div className="flex flex-col w-full py-4">
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
          <SidebarItem onClick={onCreate} icon={CirclePlus} label="Add Page" />
        </div>

        <p className="pl-5.5 pr-1 text-xs font-bold text-muted-foreground/50">
          WORKSPACE
        </p>

        <div className="py-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-secondary [&::-webkit-scrollbar-thumb]:bg-muted-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-md">
          <DocumentsList />
        </div>

        <div
          onClick={resetSidebarWidth}
          onMouseDown={handleSidebarResize}
          className="absolute top-0 right-0 h-full w-[3px] cursor-ew-resize bg-muted-foreground/10 opacity-0 transition-all hover:opacity-100"
        />
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "fixed top-0 left-60 z-50 w-[calc(100%_-_240px)]",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
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
