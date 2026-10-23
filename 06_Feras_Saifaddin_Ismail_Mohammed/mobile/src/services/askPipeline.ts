import type { AskResponse, AskViewState, MemberProfile, SourceKind } from "../types";
import { askServer, ApiTimeoutError, fetchMember, fetchMembers } from "./api";
import { bundledMembers, cacheAsk, cacheDirectory, cacheProfile, readDirectory, readLastAsk } from "./cache";
import { readNet } from "./connectivity";
import { offlineAsk, findMember } from "./offlineLookup";
import { validateQuestion } from "./validation";

function toState(data: AskResponse, source: SourceKind): AskViewState {
  if (data.noMatch || !data.match) {
    return { status: "no-match", data, source };
  }
  return { status: "success", data, source };
}

export async function runAsk(raw: string): Promise<{ state: AskViewState; validationError?: string }> {
  const problem = validateQuestion(raw);
  if (problem) {
    return { state: { status: "idle" }, validationError: problem };
  }
  const query = raw.trim();
  const net = await readNet();
  const directory = await readDirectory();

  if (!net.online) {
    const offline = offlineAsk(query, directory.length ? directory : bundledMembers());
    if (!offline.noMatch) {
      await cacheAsk(offline);
    }
    return { state: toState(offline, "offline") };
  }

  try {
    const live = await askServer(query);
    await cacheAsk(live);
    if (live.match) {
      await cacheProfile(live.match);
    }
    try {
      const members = await fetchMembers();
      await cacheDirectory(members as MemberProfile[]);
    } catch {
      // Directory cache is best-effort.
    }
    return { state: toState(live, "live") };
  } catch (error) {
    const last = await readLastAsk();
    if (error instanceof ApiTimeoutError) {
      if (last && last.query.toLowerCase() === query.toLowerCase()) {
        return { state: toState(last, "cached") };
      }
      return { state: { status: "timeout", message: "The matching service timed out after 8 seconds." } };
    }
    const offline = offlineAsk(query, directory);
    if (!offline.noMatch) {
      return { state: toState(offline, "offline") };
    }
    if (last && last.query.toLowerCase() === query.toLowerCase() && !last.noMatch) {
      return { state: toState(last, "cached") };
    }
    return {
      state: {
        status: "server-error",
        message: error instanceof Error ? error.message : "The matching service is unavailable.",
      },
    };
  }
}

export async function loadProfile(memberId: string): Promise<{ profile: MemberProfile; source: SourceKind } | null> {
  const net = await readNet();
  if (net.online) {
    try {
      const profile = await fetchMember(memberId);
      await cacheProfile(profile);
      return { profile, source: "live" };
    } catch {
      // fall through to cache
    }
  }
  const local = findMember(await readDirectory(), memberId) || findMember(bundledMembers(), memberId);
  if (local) {
    return { profile: local, source: net.online ? "cached" : "offline" };
  }
  return null;
}

export async function loadDirectory(): Promise<{ members: MemberProfile[]; source: SourceKind }> {
  const net = await readNet();
  if (net.online) {
    try {
      const members = (await fetchMembers()) as MemberProfile[];
      const bundled = bundledMembers();
      const merged = members.map((item) => {
        const full = bundled.find((row) => row.id === item.id);
        return full ? { ...full, ...item } : (item as MemberProfile);
      });
      await cacheDirectory(merged);
      return { members: merged, source: "live" };
    } catch {
      // fall through
    }
  }
  const local = await readDirectory();
  return { members: local, source: net.online ? "cached" : "offline" };
}
