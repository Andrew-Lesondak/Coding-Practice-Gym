import { describe, expect, it } from 'vitest';
import { generateAdaptivePlan, scoreCandidate } from '../lib/adaptivePlanner';
import { ProgressState } from '../types/progress';

const emptyProgress: ProgressState = {
  problems: {},
  systemDesign: {},
  systemDesignDrills: {},
  quizzes: {},
  reactCoding: {},
  reactDebugging: {}
};

describe('adaptivePlanner', () => {
  it('is deterministic with same seed and inputs', () => {
    const planA = generateAdaptivePlan({
      mode: 'dsa',
      lengthMinutes: 30,
      intensity: 'interview',
      seed: 42,
      progress: emptyProgress
    });
    const planB = generateAdaptivePlan({
      mode: 'dsa',
      lengthMinutes: 30,
      intensity: 'interview',
      seed: 42,
      progress: emptyProgress
    });
    expect(planA.blocks.map((b) => b.targetId)).toEqual(planB.blocks.map((b) => b.targetId));
  });

  it('scores due candidates higher than neutral', () => {
    const neutral = scoreCandidate({
      id: 'n',
      blockType: 'dsa_review',
      targetId: 'x',
      minutes: 5
    }, []);
    const due = scoreCandidate({
      id: 'd',
      blockType: 'dsa_review',
      targetId: 'x',
      minutes: 5,
      due: true,
      overdueDays: 3
    }, []);
    expect(due).toBeGreaterThan(neutral);
  });

  it('uses expected template for 30-minute DSA interview', () => {
    const plan = generateAdaptivePlan({
      mode: 'dsa',
      lengthMinutes: 30,
      intensity: 'interview',
      seed: 1,
      progress: emptyProgress
    });
    expect(plan.blocks.map((b) => b.blockType)).toEqual([
      'dsa_drill',
      'dsa_drill',
      'dsa_timed_problem',
      'reflection'
    ]);
  });

  it('avoids repeating the same weakness tag three times in a row', () => {
    const plan = generateAdaptivePlan({
      mode: 'mixed',
      lengthMinutes: 60,
      intensity: 'interview',
      seed: 7,
      progress: emptyProgress
    });
    const tags = plan.blocks.map((b) => b.signals.weaknessTag).filter(Boolean) as string[];
    for (let i = 2; i < tags.length; i += 1) {
      expect(!(tags[i] === tags[i - 1] && tags[i - 1] === tags[i - 2])).toBe(true);
    }
  });
});
