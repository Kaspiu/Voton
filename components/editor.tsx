"use client";

import { useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  PartialBlock,
  createCodeBlockSpec,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { codeBlockOptions } from "@blocknote/code-block";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// Reads a file and resolves with its base64 data URL for use as an editor upload handler.
const handleUpload = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// The default "file" block spec is omitted; all other defaults are preserved.
const { file: _file, ...blockSpecs } = defaultBlockSpecs;

const customCodeBlock = createCodeBlockSpec({
  indentLineWithTab: true,
  defaultLanguage: "typescript",
  supportedLanguages: {
    plaintext: { name: "Plain Text", aliases: ["text"] },
    typescript: { name: "TypeScript", aliases: ["ts"] },
    javascript: { name: "JavaScript", aliases: ["js"] },
    python: { name: "Python", aliases: ["py"] },
    java: { name: "Java" },
    csharp: { name: "C#", aliases: ["cs"] },
    cpp: { name: "C++", aliases: ["c++"] },
    go: { name: "Go", aliases: ["golang"] },
    rust: { name: "Rust", aliases: ["rs"] },
    php: { name: "PHP" },
    ruby: { name: "Ruby", aliases: ["rb"] },
    swift: { name: "Swift" },
    kotlin: { name: "Kotlin", aliases: ["kt"] },
    html: { name: "HTML" },
    css: { name: "CSS" },
    sql: { name: "SQL" },
    bash: { name: "Bash", aliases: ["shell", "sh"] },
    json: { name: "JSON" },
    yaml: { name: "YAML", aliases: ["yml"] },
    markdown: { name: "Markdown", aliases: ["md"] },
  },
  // createHighlighter causes runtime errors.
  // Likely due to a package version conflict with @blocknote/code-block.
  // Re-enable when the dependency issue is resolved.
  // createHighlighter: codeBlockOptions.createHighlighter,
});

// Schema combining preserved default blocks with the custom code block.
const schema = BlockNoteSchema.create({
  blockSpecs: { ...blockSpecs, codeBlock: customCodeBlock },
});

interface EditorProps {
  onChange: (value: string) => void;
  initialData?: string;
}

export default function Editor({ onChange, initialData }: EditorProps) {
  const { resolvedTheme } = useTheme();

  // Parses initialData as BlockNote JSON blocks, or returns undefined if absent or Markdown.
  const initialContent = useMemo(() => {
    if (!initialData) return undefined;
    try {
      return JSON.parse(initialData) as PartialBlock[];
    } catch {
      return undefined;
    }
  }, [initialData]);

  const editor = useCreateBlockNote({
    schema,
    initialContent,
    disableExtensions: ["dropFile"],
    uploadFile: handleUpload,
  });

  // If initialData exists but could not be parsed as JSON, treat it as Markdown.
  useEffect(() => {
    if (!initialData || initialContent) return;

    async function loadMarkdownContent() {
      const blocks = await editor.tryParseMarkdownToBlocks(initialData!);
      editor.replaceBlocks(editor.document, blocks);
    }

    loadMarkdownContent();
  }, [editor, initialData, initialContent]);

  const onEditorChange = () => {
    onChange(JSON.stringify(editor.document, null, 2));
  };

  return (
    <div>
      <BlockNoteView
        editor={editor}
        onChange={onEditorChange}
        theme={resolvedTheme === "light" ? "light" : "dark"}
        className="px-2.5 max-lg:px-0"
      />
    </div>
  );
}
