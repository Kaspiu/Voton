"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import {
  clearAllData,
  exportData,
  importData,
} from "@/lib/database/export-import";

interface SettingsItemProps {
  itemTitle: string;
  itemDescription: string;
  itemBtnText: string;
  itemFunc: () => void;
}

const SettingsItem = ({
  itemTitle,
  itemDescription,
  itemBtnText,
  itemFunc,
}: SettingsItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <Label>{itemTitle}</Label>
        <span className="text-muted-foreground text-xs">{itemDescription}</span>
      </div>
      <Button
        onClick={itemFunc}
        variant="outline"
        size="sm"
        className="cursor-pointer text-muted-foreground text-xs"
      >
        {itemBtnText}
      </Button>
    </div>
  );
};

export const SettingsModal = () => {
  const router = useRouter();
  const { isOpen, onClose } = useSettings();

  // Handles the data import process, shows a toast notification, and navigates on success.
  const onImportData = () => {
    const promise = importData().then(() => {
      router.push(`/documents`);
      onClose();
    });

    toast.promise(promise, {
      loading: "Importing data...",
      success: "Data imported successfully!",
      error: "Failed to import data.",
    });
  };

  // Handles the data export process and shows a toast notification.
  const onExportData = () => {
    const promise = exportData();

    toast.promise(promise, {
      loading: "Exporting data...",
      success: "Data exported successfully!",
      error: "Failed to export data.",
    });
  };

  // Handles clearing all data, shows a toast notification, and navigates on success.
  const onClearData = () => {
    const promise = clearAllData().then(() => {
      router.push(`/documents`);
    });

    toast.promise(promise, {
      loading: "Clearing all data...",
      success: "All data cleared!",
      error: "Failed to clear data.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <DialogTitle>Workspace settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <SettingsItem
            itemTitle="Import data"
            itemDescription="Bring data into your workspace"
            itemBtnText="Import"
            itemFunc={onImportData}
          />
          <SettingsItem
            itemTitle="Export data"
            itemDescription="Save a copy of your workspace"
            itemBtnText="Export"
            itemFunc={onExportData}
          />
          <SettingsItem
            itemTitle="Clear data"
            itemDescription="Remove all data permanently"
            itemBtnText="Clear"
            itemFunc={onClearData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
