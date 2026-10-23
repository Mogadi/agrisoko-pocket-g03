import { GROUP } from "../constants/group";

export function validateQuestion(raw: string): string | null {
  const query = raw.trim();
  if (!query) {
    return "Write a question first. Try a name, nickname, role or feature.";
  }
  if (query.length < GROUP.minQueryLength) {
    return "That question is too short.";
  }
  if (query.length > GROUP.maxQueryLength) {
    return `Keep the question under ${GROUP.maxQueryLength} characters.`;
  }
  return null;
}
