"use client";

import { useRef, useState } from "react";
import { ImagePlus, SmilePlus, X } from "lucide-react"; // External library

import { Button } from "@/components/ui/button"; // Internal components
import { EmojiPickerPopover } from "@/components/emoji-picker"; // Internal components
import { useCoverImage } from "@/hooks/use-cover-image";
import { updatePage } from "@/lib/database/pages";
import { Page } from "@/lib/database/types";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  initialData: Page;
}

export const Toolbar = ({ initialData }: ToolbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialData.title || "Untitled");

  const onCoverImageOpen = useCoverImage((state) => state.onOpen);

  // Sets the title input to be editable.
  const enableInput = () => {
    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, initialData.title.length);
    }, 100);
  };

  // Sets the title input to be non-editable.
  const disableInput = () => {
    setIsEditing(false);
  };

  // Handles changes to the title input and updates the page.
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updatePage(initialData.id, {
      title: e.target.value || "Untitled",
    });
  };

  // Handles the "Enter" key press to disable editing.
  const onEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      disableInput();
    }
  };

  // Updates the page icon with the selected emoji.
  const onEmojiSelect = (emoji: string) => {
    updatePage(initialData.id, {
      icon: emoji,
    });
  };

  // Removes the page icon.
  const onEmojiDelete = () => {
    updatePage(initialData.id, {
      icon: undefined,
    });
  };

  return (
    <div className="group mb-12 mt-6 flex flex-col justify-center px-16 max-md:px-13.5">
      <div
        className={cn(
          "mb-2 flex w-fit items-center gap-2 opacity-0 transition-all group-hover:opacity-100 max-md:opacity-100",
          !!initialData.icon && "mb-4"
        )}
      >
        {!initialData.icon && (
          <EmojiPickerPopover asChild onEmojiClick={onEmojiSelect}>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs text-muted-foreground"
            >
              <SmilePlus className="h-4 w-4" />
              Add icon
            </Button>
          </EmojiPickerPopover>
        )}
        {!initialData.coverImage && (
          <Button
            onClick={onCoverImageOpen}
            variant="outline"
            size="sm"
            className="cursor-pointer text-xs text-muted-foreground"
          >
            <ImagePlus className="h-4 w-4" />
            Add cover
          </Button>
        )}
      </div>

      {!!initialData.icon && (
        <div className="group/icon mb-2 flex w-fit items-center">
          <EmojiPickerPopover onEmojiClick={onEmojiSelect}>
            <p className="cursor-pointer text-6xl transition-all hover:opacity-75">
              {initialData.icon}
            </p>
          </EmojiPickerPopover>
          <Button
            onClick={onEmojiDelete}
            variant="outline"
            size="icon"
            className="cursor-pointer rounded-xl text-xs text-muted-foreground opacity-0 transition-all group-hover/icon:opacity-100 max-md:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onBlur={disableInput}
          onKeyDown={onEnterKeyDown}
          onChange={onChange}
          className="flex w-full items-center text-6xl font-bold text-[#3F3F3F] focus:outline-none dark:text-[#CFCFCF]"
        />
      ) : (
        <div
          role="button"
          onClick={enableInput}
          className="flex h-[80px] max-w-fit items-center truncate text-6xl font-bold text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};
