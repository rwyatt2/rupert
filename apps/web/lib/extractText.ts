export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_EXTRACT_CHARS = 80_000;

export type ExtractorKind = "text" | "markdown" | "csv" | "html" | "json" | "pdf" | "docx";

export interface ExtractedText {
  text: string;
  extractor: ExtractorKind;
  truncated: boolean;
}

const EXTENSION_KIND: Record<string, ExtractorKind> = {
  txt: "text",
  md: "markdown",
  markdown: "markdown",
  csv: "csv",
  html: "html",
  htm: "html",
  json: "json",
  pdf: "pdf",
  docx: "docx",
};

const MIME_KIND: Record<string, ExtractorKind> = {
  "text/plain": "text",
  "text/markdown": "markdown",
  "text/csv": "csv",
  "text/html": "html",
  "application/json": "json",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const ACCEPT_FILE_TYPES =
  ".txt,.md,.markdown,.csv,.html,.htm,.json,.pdf,.docx,text/plain,text/markdown,text/csv,text/html,application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function extensionOf(filename: string): string {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

export function resolveExtractorKind(file: File): ExtractorKind | null {
  const ext = extensionOf(file.name);
  if (ext && EXTENSION_KIND[ext]) return EXTENSION_KIND[ext];
  return MIME_KIND[file.type] || null;
}

function truncate(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_EXTRACT_CHARS) return { text, truncated: false };
  return {
    text: `${text.slice(0, MAX_EXTRACT_CHARS)}\n\n[Truncated after ${MAX_EXTRACT_CHARS.toLocaleString()} characters]`,
    truncated: true,
  };
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body?.textContent || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    if (line.trim()) pages.push(line);
  }
  return pages.join("\n\n").trim();
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const { extractRawText } = await import("mammoth");
  const result = await extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is larger than ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);
  }

  const ext = extensionOf(file.name);
  if (ext === "doc") {
    throw new Error("Legacy .doc files are not supported. Save as .docx or PDF.");
  }

  const kind = resolveExtractorKind(file);
  if (!kind) {
    throw new Error(
      `Unsupported file type${ext ? ` (.${ext})` : ""}. Use txt, md, json, csv, html, pdf, or docx.`,
    );
  }

  let raw = "";
  if (kind === "pdf") {
    raw = await extractPdf(await file.arrayBuffer());
  } else if (kind === "docx") {
    raw = await extractDocx(await file.arrayBuffer());
  } else if (kind === "html") {
    raw = stripHtml(await file.text());
  } else {
    raw = (await file.text()).trim();
  }

  if (!raw) {
    throw new Error("No extractable text in this file. Scanned PDFs are not supported.");
  }

  const { text, truncated } = truncate(raw);
  return { text, extractor: kind, truncated };
}
