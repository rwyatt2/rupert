import { parseIdeaMarkdown, type IdeaInput } from "@rupert/core";

export function parseIdeaNote(filename: string, content: string): IdeaInput {
  return parseIdeaMarkdown(filename, content);
}
