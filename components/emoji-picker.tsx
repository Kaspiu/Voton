"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const themeMap = {
    light: Theme.LIGHT,
    dark: Theme.DARK,
  };
  const currentTheme = (resolvedTheme || "light") as keyof typeof themeMap;
  const theme = themeMap[currentTheme];

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="w-full border-none bg-popover p-0 text-popover-foreground shadow-none">
        <EmojiPicker
          height={500}
          theme={theme}
          onEmojiClick={(data) => onEmojiClick(data.emoji)}
        />
      </PopoverContent>
    </Popover>
  );
};
