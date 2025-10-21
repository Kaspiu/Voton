"use client";

import { useTheme } from "next-themes";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  PartialBlock,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface EditorProps {
  onChange: (value: string) => void;
  initialData?: string;
}

export default function Editor({ onChange, initialData }: EditorProps) {
  const { resolvedTheme } = useTheme();

  // Handles file uploads to the editor.
  const handleUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  // Remove the file block from the default schema
  const { file, ...remainingBlockSpecs } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...remainingBlockSpecs,
    },
  });

  // Creates and configures the BlockNote editor instance.
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialData
      ? (JSON.parse(initialData) as PartialBlock[])
      : undefined,
    disableExtensions: ["dropFile"],
    uploadFile: handleUpload,
  });

  // Triggers the onChange callback with the editor's content as a JSON string.
  const onEditorChange = () => {
    onChange(JSON.stringify(editor.document, null, 2));
  };

  return (
    <div>
      <BlockNoteView
        editor={editor}
        onChange={onEditorChange}
        theme={resolvedTheme === "light" ? "light" : "dark"}
        className="max-md:px-0 px-2.5"
      />
    </div>
  );
}
