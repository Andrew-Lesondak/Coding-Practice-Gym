export type SystemDesignMockSession = {
  id: string;
  promptId: string;
  drills: {
    requirementsDrillId: string;
    apiDrillId: string;
    scalingDrillId: string;
  };
  phaseIndex: number;
  phaseStartedAt: number | null;
  phaseTimeRemainingSeconds: number;
  phaseDurations?: Record<string, number>;
  responses: {
    drillResponses: Record<string, { content: string; rubricChecks: Record<string, boolean>; completedAt?: number }>;
    fullDesignResponse: { content: string; rubricChecks: Record<string, boolean>; completedAt?: number } | null;
  };
  scores: {
    drillScores: Record<string, number>;
    fullDesignScore: number;
  };
  confidenceRating?: number;
  reflection?: {
    wentWell: string;
    change: string;
    weakestPhase: string;
  };
  completedAt?: number;
};
