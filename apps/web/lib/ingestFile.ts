import { classifyIdeaSource, type ClassifiedIdeaSource, type IdeaInput } from "@rupert/core";
import { extractTextFromFile, type ExtractorKind } from "@/lib/extractText";

const PREVIEW_CHARS = 480;

export interface FileAttachment {
  filename: string;
  byteSize: number;
  extractor: ExtractorKind;
  charCount: number;
  truncated: boolean;
  preview: string;
  classification: ClassifiedIdeaSource;
}

export function labeledBriefNote(filename: string, text: string): string {
  return `[${filename}]\n\n${text}`;
}

export function ideaFromAttachment(attachment: FileAttachment | null): IdeaInput | null {
  return attachment?.classification.kind === "idea" ? attachment.classification.idea : null;
}

export function briefNoteFromAttachment(attachment: FileAttachment | null): string | null {
  if (!attachment || attachment.classification.kind !== "brief") return null;
  return labeledBriefNote(attachment.filename, attachment.classification.text);
}

export async function ingestDroppedFile(file: File): Promise<FileAttachment> {
  const extracted = await extractTextFromFile(file);
  const classification = classifyIdeaSource({ filename: file.name, text: extracted.text });
  const sourceText = classification.kind === "idea" ? extracted.text : classification.text;
  return {
    filename: file.name,
    byteSize: file.size,
    extractor: extracted.extractor,
    charCount: extracted.text.length,
    truncated: extracted.truncated,
    preview: sourceText.slice(0, PREVIEW_CHARS),
    classification,
  };
}
