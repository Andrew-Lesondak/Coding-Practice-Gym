export type DSAProblemStats = {
  id: string;
  patterns: string[];
  attempts: number;
  passes: number;
  lastAttemptedAt?: string;
  lastPassedAt?: string;
  score: number; // passes/attempts
  confidence?: number;
  durationSeconds?: number | null;
};

export type DSASpeedDrillStats = {
  drillId: string;
  problemId: string;
  drillType: string;
  difficulty: string;
  patterns: string[];
  completedAt: string;
  durationSeconds: number;
  passed: boolean;
  confidence: number;
};

export type SystemDesignDrillStats = {
  drillId: string;
  score: number;
  lastAttemptedAt?: string;
  confidence?: number;
  rubricCategories: string[];
};

export type MockInterviewStats = {
  sessionId: string;
  promptId: string;
  completedAt?: number;
  phaseScores: Record<string, number>;
  phaseDurations: Record<string, number>;
  confidence?: number;
};

export type Insight = {
  id: string;
  title: string;
  detail: string;
  recommendation: string;
  data: Record<string, unknown>;
};
