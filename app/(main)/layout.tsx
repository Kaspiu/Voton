/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { SearchCommand } from "@/components/modals/search-command";
import { SettingsModal } from "@/components/modals/settings-modal";
import { Spinner } from "@/components/spinner";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "./_components/navigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <Navigation />
      <SearchCommand />
      <SettingsModal />

      <main className="h-full flex-1 overflow-y-auto">{children}</main>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default MainLayout;
