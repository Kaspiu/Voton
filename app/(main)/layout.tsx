"use client";

import { MoveToCommand } from "@/components/modals/move-to-command";
import { SearchCommand } from "@/components/modals/search-command";
import { SettingsModal } from "@/components/modals/settings-modal";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "./_components/navigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full bg-background dark:bg-[#1F1F1F]">
      <Navigation />
      <SearchCommand />
      <SettingsModal />
      <MoveToCommand />

      <main className="h-full flex-1 overflow-y-auto">{children}</main>

      <Toaster position="bottom-center" />
    </div>
  );
};

export default MainLayout;
