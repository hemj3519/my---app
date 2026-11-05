export interface FeatureItem {
  part: string;
  comment: string;
}

export interface AnalysisResult {
  nickname: string;
  summary: string;
  features: FeatureItem[];
  luckyItem: string;
}

export type ErrorCode = "FORMAT" | "SIZE" | "NO_FACE" | "QUOTA" | "FAILED";

export type AppScreen = "idle" | "preview" | "loading" | "result" | "error";
