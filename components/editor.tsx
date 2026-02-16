"use client";

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

  // Configures the custom code block spec
  const customCodeBlock = createCodeBlockSpec({
    indentLineWithTab: true,
    defaultLanguage: "typescript",
    supportedLanguages: {
      plaintext: {
        name: "Plain Text",
        aliases: ["text"],
      },
      typescript: {
        name: "TypeScript",
        aliases: ["ts"],
      },
      javascript: {
        name: "JavaScript",
        aliases: ["js"],
      },
      python: {
        name: "Python",
        aliases: ["py"],
      },
      java: {
        name: "Java",
      },
      csharp: {
        name: "C#",
        aliases: ["cs"],
      },
      cpp: {
        name: "C++",
        aliases: ["c++"],
      },
      go: {
        name: "Go",
        aliases: ["golang"],
      },
      rust: {
        name: "Rust",
        aliases: ["rs"],
      },
      php: {
        name: "PHP",
      },
      ruby: {
        name: "Ruby",
        aliases: ["rb"],
      },
      swift: {
        name: "Swift",
      },
      kotlin: {
        name: "Kotlin",
        aliases: ["kt"],
      },
      html: {
        name: "HTML",
      },
      css: {
        name: "CSS",
      },
      sql: {
        name: "SQL",
      },
      bash: {
        name: "Bash",
        aliases: ["shell", "sh"],
      },
      json: {
        name: "JSON",
      },
      yaml: {
        name: "YAML",
        aliases: ["yml"],
      },
      markdown: {
        name: "Markdown",
        aliases: ["md"],
      },
    },
    createHighlighter: codeBlockOptions.createHighlighter,
  });

  // Configures the editor schema.
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...remainingBlockSpecs,
      codeBlock: customCodeBlock,
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
        className="max-lg:px-0 px-2.5"
      />
    </div>
  );
}
