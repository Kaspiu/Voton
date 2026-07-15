"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { ClearModal } from "@/components/modals/clear-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { useIsMac } from "@/hooks/use-is-mac";
import { useSettings } from "@/hooks/use-settings";
import {
  clearAllData,
  exportData,
  importData,
} from "@/lib/database/export-import";

interface SettingsItemProps {
  title: string;
  description: string;
  onAction: () => void;
  buttonLabel?: string;
  isClear?: boolean;
}

const SettingsItem = ({
  title,
  description,
  onAction,
  buttonLabel,
  isClear,
}: SettingsItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2 mr-8">
        <Label>{title}</Label>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      {isClear ? (
        <ClearModal onClear={onAction} />
      ) : (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="cursor-pointer text-xs text-muted-foreground"
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};

export const SettingsModal = () => {
  const router = useRouter();
  const { isOpen, onClose } = useSettings();
  const { isFocusMode, setFocusMode } = useFocusMode();
  const isMac = useIsMac();

  // Triggers a data import, closes the modal on success, and shows a toast for each state.
  const onImportData = () => {
    const promise = importData().then(onClose);

    toast.promise(promise, {
      loading: "Importing data...",
      success: "Data imported successfully!",
      error: "Failed to import data.",
    });
  };

  // Triggers a data export and shows a toast for each state.
  const onExportData = () => {
    const promise = exportData();

    toast.promise(promise, {
      loading: "Exporting data...",
      success: "Data exported successfully!",
      error: "Failed to export data.",
    });
  };

  // Clears all workspace data, redirects to the documents root, and shows a toast for each state.
  const onClearData = () => {
    const promise = clearAllData().then(() => router.push("/documents"));

    toast.promise(promise, {
      loading: "Clearing all data...",
      success: "All data cleared!",
      error: "Failed to clear data.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent closeClassName="top-6 right-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Workspace settings</DialogTitle>
        </DialogHeader>

        <p className="text-lg font-semibold leading-none">Data management</p>
        <div className="flex flex-col gap-4">
          <SettingsItem
            title="Import data"
            description="Bring data into your workspace."
            buttonLabel="Import"
            onAction={onImportData}
          />
          <SettingsItem
            title="Export data"
            description="Save a copy of your workspace."
            buttonLabel="Export"
            onAction={onExportData}
          />
          <SettingsItem
            title="Clear data"
            description="Remove all data permanently."
            onAction={onClearData}
            isClear
          />
        </div>

        <Separator />

        <p className="text-lg font-semibold leading-none">Appearance</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 mr-12">
            <Label>Theme</Label>
            <span className="text-xs text-muted-foreground">
              Switch between light and dark mode.
            </span>
          </div>
          <ModeToggle />
        </div>

        <Separator />

        <p className="text-lg font-semibold leading-none">Layout</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 mr-12">
            <Label>Focus mode</Label>
            <span className="text-xs text-muted-foreground">
              Hide the sidebar and navbar to minimize distractions while
              working.
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              Shortcut:
              <kbd className="flex items-center rounded-sm border bg-secondary px-2 font-mono text-[10px]">
                {isMac ? "⌘ + ⌥ + F" : "Ctrl + Alt + F"}
              </kbd>
            </span>
          </div>
          <Switch
            checked={isFocusMode}
            onCheckedChange={setFocusMode}
            className="cursor-pointer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
