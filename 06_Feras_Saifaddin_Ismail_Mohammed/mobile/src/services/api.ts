import axios, { AxiosError } from "axios";

import { GROUP } from "../constants/group";
import type { AskResponse, DirectoryMember, HealthResponse, MemberProfile, ModelInfo } from "../types";
import { getApiUrl } from "./cache";

export class ApiTimeoutError extends Error {
  constructor(message = "The matching service timed out.") {
    super(message);
    this.name = "ApiTimeoutError";
  }
}

export class ApiUnavailableError extends Error {
  constructor(message = "The matching service is unavailable.") {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

async function client() {
  const baseURL = await getApiUrl(GROUP.defaultApiUrl);
  return axios.create({
    baseURL,
    timeout: GROUP.timeoutMs,
    headers: { "Content-Type": "application/json" },
  });
}

function wrap(error: unknown): never {
  const err = error as AxiosError;
  if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
    throw new ApiTimeoutError();
  }
  throw new ApiUnavailableError(
    err.response?.status ? `Server responded with ${err.response.status}.` : "The matching service is unavailable."
  );
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const http = await client();
    const { data } = await http.get<HealthResponse>("/health");
    return data;
  } catch (error) {
    wrap(error);
  }
}

export async function fetchMembers(): Promise<DirectoryMember[]> {
  try {
    const http = await client();
    const { data } = await http.get<DirectoryMember[]>("/members");
    return data;
  } catch (error) {
    wrap(error);
  }
}

export async function fetchMember(id: string): Promise<MemberProfile> {
  try {
    const http = await client();
    const { data } = await http.get<MemberProfile>(`/members/${id}`);
    return data;
  } catch (error) {
    wrap(error);
  }
}

export async function askServer(query: string): Promise<AskResponse> {
  try {
    const http = await client();
    const { data } = await http.post<AskResponse>("/ask", { query });
    return data;
  } catch (error) {
    wrap(error);
  }
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  try {
    const http = await client();
    const { data } = await http.get<ModelInfo>("/model-info");
    return data;
  } catch (error) {
    wrap(error);
  }
}
