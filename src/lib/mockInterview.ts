import { SystemDesignDrill } from '../types/systemDesignDrill';
import { SystemDesignMockSession } from '../types/systemDesignMock';

export type MockPhase = {
  id: 'requirements' | 'api-data' | 'scaling-reliability' | 'full-design' | 'reflection';
  label: string;
  seconds: number;
};

export const phases: MockPhase[] = [
  { id: 'requirements', label: 'Requirements Drill', seconds: 5 * 60 },
  { id: 'api-data', label: 'API + Data Drill', seconds: 10 * 60 },
  { id: 'scaling-reliability', label: 'Scaling + Reliability Drill', seconds: 10 * 60 },
  { id: 'full-design', label: 'Full System Design', seconds: 15 * 60 },
  { id: 'reflection', label: 'Reflection', seconds: 5 * 60 }
];

export const selectDrillsForPrompt = (
  drills: SystemDesignDrill[],
  promptId: string,
  difficulty: SystemDesignDrill['difficulty']
) => {
  const byPrompt = (type: SystemDesignDrill['type']) =>
    drills.filter((drill) => drill.type === type && drill.relatedPromptId === promptId);
  const fallback = (type: SystemDesignDrill['type']) =>
    drills.filter((drill) => drill.type === type && drill.difficulty === difficulty);
  const pick = (type: SystemDesignDrill['type']) => byPrompt(type)[0] ?? fallback(type)[0] ?? drills.find((d) => d.type === type)!;

  return {
    requirementsDrillId: pick('requirements').id,
    apiDrillId: pick('api').id,
    scalingDrillId: pick('data-scaling').id
  };
};

export const createMockSession = (
  promptId: string,
  drills: SystemDesignDrill[],
  difficulty: SystemDesignDrill['difficulty']
): SystemDesignMockSession => {
  const selected = selectDrillsForPrompt(drills, promptId, difficulty);
  return {
    id: crypto.randomUUID(),
    promptId,
    drills: selected,
    phaseIndex: 0,
    phaseStartedAt: null,
    phaseTimeRemainingSeconds: phases[0].seconds,
    responses: {
      drillResponses: {},
      fullDesignResponse: null
    },
    scores: {
      drillScores: {},
      fullDesignScore: 0
    }
  };
};

export const advancePhase = (session: SystemDesignMockSession): SystemDesignMockSession => {
  const nextIndex = Math.min(session.phaseIndex + 1, phases.length - 1);
  return {
    ...session,
    phaseIndex: nextIndex,
    phaseStartedAt: null,
    phaseTimeRemainingSeconds: phases[nextIndex].seconds
  };
};

export const isSessionComplete = (session: SystemDesignMockSession) =>
  session.phaseIndex === phases.length - 1 && Boolean(session.completedAt);
