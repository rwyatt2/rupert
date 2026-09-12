export function formatVerdict(verdict: string) {
  return verdict.replaceAll("_", " ").toLowerCase();
}
