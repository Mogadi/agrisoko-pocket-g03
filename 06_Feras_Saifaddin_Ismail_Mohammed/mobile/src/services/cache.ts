import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AskResponse, MemberProfile } from "../types";
import bundled from "../data/members.json";

const KEYS = {
  apiUrl: "agrisoko.apiUrl",
  directory: "agrisoko.directory",
  lastAsk: "agrisoko.lastAsk",
  lastProfile: "agrisoko.lastProfile",
};

export type BundledDataset = {
  groupCode: string;
  verificationCode: string;
  members: MemberProfile[];
};

export function bundledMembers(): MemberProfile[] {
  return (bundled as BundledDataset).members;
}

export async function getApiUrl(fallback: string): Promise<string> {
  const stored = await AsyncStorage.getItem(KEYS.apiUrl);
  return (stored || fallback).replace(/\/$/, "");
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.apiUrl, url.replace(/\/$/, ""));
}

export async function cacheDirectory(members: MemberProfile[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.directory, JSON.stringify(members));
}

export async function readDirectory(): Promise<MemberProfile[]> {
  const raw = await AsyncStorage.getItem(KEYS.directory);
  if (!raw) {
    return bundledMembers();
  }
  try {
    const parsed = JSON.parse(raw) as MemberProfile[];
    return parsed.length ? parsed : bundledMembers();
  } catch {
    return bundledMembers();
  }
}

export async function cacheAsk(result: AskResponse): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastAsk, JSON.stringify(result));
}

export async function readLastAsk(): Promise<AskResponse | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastAsk);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AskResponse;
  } catch {
    return null;
  }
}

export async function cacheProfile(profile: MemberProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastProfile, JSON.stringify(profile));
}

export async function readLastProfile(): Promise<MemberProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastProfile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberProfile;
  } catch {
    return null;
  }
}
