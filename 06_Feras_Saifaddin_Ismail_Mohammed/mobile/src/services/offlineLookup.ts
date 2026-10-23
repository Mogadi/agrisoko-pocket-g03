import type { AskResponse, MemberProfile } from "../types";

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function exactNameOrRole(query: string, member: MemberProfile): boolean {
  const q = norm(query);
  if (!q) return false;
  const names = [member.fullName, member.role, ...(member.aliases || [])].map(norm);
  return names.some((name) => name && (q.includes(name) || name.includes(q)));
}

export function offlineAsk(query: string, members: MemberProfile[]): AskResponse {
  const hits = members.filter((member) => exactNameOrRole(query, member));

  if (hits.length === 1) {
    const member = hits[0];
    return {
      query,
      groupCode: "G03",
      modelVersion: "offline-exact-1.0.0",
      match: member,
      confidence: 1,
      reason: "Offline exact name, nickname or role lookup from the bundled directory.",
      matchedTerms: [member.fullName],
      introduction: member.introductionDraft,
      evidenceLinks: member.evidenceLinks,
      noMatch: false,
      suggestions: [],
      threshold: 1,
      boostApplied: true,
    };
  }

  return {
    query,
    groupCode: "G03",
    modelVersion: "offline-exact-1.0.0",
    match: null,
    confidence: 0,
    reason:
      "No offline match. Without a network the phone only answers exact names, nicknames and roles. Try Osama, Nuzha, Ehab, Mojtaba, Lazarus or Feras.",
    matchedTerms: [],
    introduction: null,
    evidenceLinks: null,
    noMatch: true,
    suggestions: members.map((m) => m.fullName),
    threshold: 1,
    boostApplied: false,
  };
}

export function findMember(members: MemberProfile[], memberId: string): MemberProfile | undefined {
  return members.find((member) => member.id === memberId);
}
