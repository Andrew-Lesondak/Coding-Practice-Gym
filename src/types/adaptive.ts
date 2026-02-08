export type AdaptiveSessionPlan = {
  id: string;
  createdAt: number;
  mode: 'dsa' | 'system-design' | 'mixed';
  lengthMinutes: number;
  intensity: 'chill' | 'interview';
  blocks: AdaptiveBlock[];
  summary: {
    primaryFocus: string[];
    dueReviewCount: number;
    estimatedTotalMinutes: number;
  };
  seed: number;
};

export type AdaptiveBlock = {
  id: string;
  blockType:
    | 'dsa_review'
    | 'dsa_drill'
    | 'dsa_timed_problem'
    | 'react_problem'
    | 'sd_review'
    | 'sd_drill'
    | 'sd_timed_prompt'
    | 'sd_mock_phase'
    | 'reflection';
  title: string;
  targetId: string;
  minutes: number;
  timed: boolean;
  rationale: string;
  signals: {
    due?: boolean;
    weaknessTag?: string;
    speedGap?: boolean;
    transferGap?: boolean;
    confidenceMismatch?: boolean;
  };
  userEditable: boolean;
};

export type AdaptiveBlockOutcome = {
  blockId: string;
  targetId: string;
  blockType: AdaptiveBlock['blockType'];
  completedAt: string;
  timeUsedSeconds: number;
  pass?: boolean;
  score?: number;
  confidence?: number;
};

export type AdaptiveSessionRun = {
  sessionId: string;
  planId: string;
  startedAt: string;
  completedAt?: string;
  outcomes: AdaptiveBlockOutcome[];
};
