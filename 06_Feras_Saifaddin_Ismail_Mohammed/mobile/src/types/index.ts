export type SourceKind = "live" | "cached" | "offline";

export type EvidenceLinks = {
  repository?: string | null;
  issue?: string | null;
  branch?: string | null;
  pullRequest?: string | null;
  commit?: string | null;
};

export type DirectoryMember = {
  id: string;
  fullName: string;
  aliases: string[];
  githubUsername?: string | null;
  role: string;
  skills: string[];
  feature?: string | null;
};

export type MemberProfile = DirectoryMember & {
  registrationNumber: string;
  targetUser: string;
  problem: string;
  contribution: string;
  outcomeMetric: string;
  evidenceLinks: EvidenceLinks;
  testerFeedback: string;
  introductionDraft: string;
};

export type AskResponse = {
  query: string;
  groupCode: string;
  modelVersion: string;
  match: MemberProfile | null;
  confidence: number;
  reason: string;
  matchedTerms: string[];
  introduction: string | null;
  evidenceLinks: EvidenceLinks | null;
  noMatch: boolean;
  suggestions: string[];
  threshold: number;
  boostApplied: boolean;
};

export type HealthResponse = {
  status: string;
  version: string;
  groupCode: string;
  modelVersion: string;
  memberCount: number;
};

export type ModelInfo = {
  vectorizerType: string;
  threshold: number;
  exactBoost: number;
  datasetFingerprint: string;
  memberCount: number;
  modelVersion: string;
  groupCode: string;
  limitations: string[];
  buildCommit: string;
  evaluation: {
    top1Accuracy?: number;
    noMatchRejectionAccuracy?: number;
  } | null;
};

export type AskViewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AskResponse; source: SourceKind }
  | { status: "no-match"; data: AskResponse; source: SourceKind }
  | { status: "timeout"; message: string }
  | { status: "server-error"; message: string }
  | { status: "offline-empty"; message: string };

export type RootTabParamList = {
  HomeTab: undefined;
  AskTab: undefined;
  DirectoryTab: undefined;
  AboutTab: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Result: { query?: string; presetId?: string };
  Profile: { memberId: string; source?: SourceKind };
};
