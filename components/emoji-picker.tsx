"use client";

import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  children: React.ReactNode;
  onEmojiClick: (emoji: string) => void;
  asChild?: boolean;
}

export const EmojiPickerPopover = ({
  onEmojiClick,
  children,
  asChild,
}: EmojiPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="border-none p-0 shadow-none w-full">
        <EmojiPicker
          height={500}
          onEmojiClick={(data) => onEmojiClick(data.emoji)}
        />
      </PopoverContent>
    </Popover>
  );
};
