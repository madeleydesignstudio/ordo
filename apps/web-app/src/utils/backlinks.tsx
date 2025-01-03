import { Todo } from "../types";

// Normalize text for comparison by trimming whitespace and converting to lowercase
function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findTaskByBacklink(
  text: string,
  todos: Todo[]
): Todo | undefined {
  const normalizedText = normalizeText(text);
  return todos.find((t) => normalizeText(t.content) === normalizedText);
}
