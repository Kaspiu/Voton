"use client";

import { PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface EditorProps {
  onChange: (value: string) => void;
  initialData?: string;
}

export default function Editor({ onChange, initialData }: EditorProps) {
  // Handles file uploads to the editor.
  const handleUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    return url;
  };

  // Creates and configures the BlockNote editor instance.
  const editor = useCreateBlockNote({
    initialContent: initialData
      ? (JSON.parse(initialData) as PartialBlock[])
      : undefined,
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
        theme="light"
        className="max-md:px-0 px-2.5"
      />
    </div>
  );
}
