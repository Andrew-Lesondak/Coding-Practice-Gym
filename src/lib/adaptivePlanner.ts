import { problems } from '../data/problems';
import { dsaDrills } from '../data/dsaDrills';
import { systemDesignPrompts } from '../data/systemDesignPrompts';
import { systemDesignDrills } from '../data/systemDesignDrills';
import { reactCodingProblems } from '../data/reactCodingProblems';
import { AdaptiveBlock, AdaptiveSessionPlan } from '../types/adaptive';
import { ProgressState } from '../types/progress';
import {
  buildDSAProblemStats,
  buildDSASpeedDrillStats,
  buildSystemDesignDrillStats,
  buildMockInterviewStats,
  buildReactCodingStats
} from './analytics/engine';
import { DSASpeedDrillStats, DSAProblemStats, SystemDesignDrillStats } from './analytics/types';
import { loadDrillAttempts } from './dsaDrillStorage';
import { Difficulty } from '../types/problem';

export type AdaptiveMode = AdaptiveSessionPlan['mode'];
export type AdaptiveIntensity = AdaptiveSessionPlan['intensity'];

type LowerDifficulty = 'easy' | 'medium' | 'hard';

type Candidate = {
  id: string;
  blockType: AdaptiveBlock['blockType'];
  targetId: string;
  minutes: number;
  weaknessTag?: string;
  due?: boolean;
  overdueDays?: number;
  speedGap?: boolean;
  transferGap?: boolean;
  confidenceMismatch?: boolean;
  lastAttemptedAt?: string;
  score?: number;
  difficulty?: LowerDifficulty;
};

type CandidatePools = {
  dueDSA: Candidate[];
  dueSD: Candidate[];
  dueSDDrills: Candidate[];
  dueReact: Candidate[];
  dsaWeaknessCandidates: Candidate[];
  dsaDrillCandidates: Candidate[];
  sdDrillCandidates: Candidate[];
  sdPromptCandidates: Candidate[];
  reactProblemCandidates: Candidate[];
  speedGapPatterns: Set<string>;
  weakestPatterns: string[];
  weakestReactTopics: string[];
};

type PlannerInputs = {
  mode: AdaptiveMode;
  lengthMinutes: number;
  intensity: AdaptiveIntensity;
  seed: number;
  progress: ProgressState;
};

const dayMs = 24 * 60 * 60 * 1000;

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const toId = (value: string) => value.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

const normalizeDifficulty = (difficulty?: Difficulty | LowerDifficulty): LowerDifficulty | undefined => {
  if (!difficulty) return undefined;
  if (typeof difficulty === 'string') {
    if (difficulty === 'Easy') return 'easy';
    if (difficulty === 'Medium') return 'medium';
    if (difficulty === 'Hard') return 'hard';
  }
  return difficulty as LowerDifficulty;
};

const getOverdueDays = (nextReviewAt?: string) => {
  if (!nextReviewAt) return 0;
  const diff = Date.now() - new Date(nextReviewAt).getTime();
  return diff > 0 ? Math.floor(diff / dayMs) : 0;
};

const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const determineDSAFailureMode = (dsaStats: DSAProblemStats[], drillStats: DSASpeedDrillStats[]) => {
  const avgAccuracy = avg(dsaStats.map((s) => s.score));
  const drillPass = avg(drillStats.map((s) => (s.passed ? 1 : 0)));
  if (avgAccuracy >= 0.7 && drillPass > 0 && drillPass <= 0.5) return 'speed_gap';
  if (avgAccuracy > 0 && avgAccuracy <= 0.5) return 'accuracy_gap';
  return 'mixed';
};

const determineSDFailureMode = (sdDrillStats: SystemDesignDrillStats[]) => {
  if (sdDrillStats.length === 0) return 'mixed';
  const categoryScores: Record<string, number[]> = {};
  sdDrillStats.forEach((stat) => {
    stat.rubricCategories.forEach((cat) => {
      categoryScores[cat] = categoryScores[cat] ?? [];
      categoryScores[cat].push(stat.score);
    });
  });
  const sorted = Object.entries(categoryScores)
    .map(([cat, scores]) => ({ cat, score: avg(scores) }))
    .sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  if (!weakest) return 'mixed';
  if (weakest.cat.includes('reliability')) return 'reliability_gap';
  if (weakest.cat.includes('requirements')) return 'requirements_slow';
  if (weakest.cat.includes('trade')) return 'tradeoffs_weak';
  return 'mixed';
};

export const buildCandidatePools = (progress: ProgressState): CandidatePools => {
  const dsaStats = buildDSAProblemStats(progress);
  const drillStats = buildDSASpeedDrillStats();
  const sdDrillStats = buildSystemDesignDrillStats(progress);
  const mockStats = buildMockInterviewStats();
  const reactStats = buildReactCodingStats(progress);

  const speedGapPatterns = new Set<string>();
  const patternAccuracy: Record<string, number[]> = {};
  const patternDrillPass: Record<string, number[]> = {};

  dsaStats.forEach((stat) => {
    stat.patterns.forEach((pattern) => {
      patternAccuracy[pattern] = patternAccuracy[pattern] ?? [];
      patternAccuracy[pattern].push(stat.score);
    });
  });
  drillStats.forEach((stat) => {
    stat.patterns.forEach((pattern) => {
      patternDrillPass[pattern] = patternDrillPass[pattern] ?? [];
      patternDrillPass[pattern].push(stat.passed ? 1 : 0);
    });
  });
  Object.entries(patternAccuracy).forEach(([pattern, scores]) => {
    const accuracy = avg(scores);
    const pass = avg(patternDrillPass[pattern] ?? []);
    if (accuracy >= 0.7 && pass > 0 && pass <= 0.5) {
      speedGapPatterns.add(pattern);
    }
  });

  const weakestPatterns = Object.entries(patternAccuracy)
    .map(([pattern, scores]) => ({ pattern, score: avg(scores) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((p) => p.pattern);

  const overconfidence = new Set<string>();
  dsaStats.forEach((stat) => {
    if ((stat.confidence ?? 0) >= 4 && stat.score <= 0.5) {
      stat.patterns.forEach((pattern) => overconfidence.add(pattern));
    }
  });

  const sdTransferGap = (() => {
    if (sdDrillStats.length === 0 || mockStats.length === 0) return false;
    const drillAvg = avg(sdDrillStats.map((s) => s.score));
    const mockAvg = avg(mockStats.map((s) => avg(Object.values(s.phaseScores))));
    return drillAvg >= 0.7 && mockAvg > 0 && mockAvg <= 0.5;
  })();

  const reactTopicAccuracy: Record<string, number[]> = {};
  reactStats.forEach((stat) => {
    stat.topics.forEach((topic) => {
      reactTopicAccuracy[topic] = reactTopicAccuracy[topic] ?? [];
      reactTopicAccuracy[topic].push(stat.score);
    });
  });
  const weakestReactTopics = Object.entries(reactTopicAccuracy)
    .map(([topic, scores]) => ({ topic, score: avg(scores) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => item.topic);

  const dueDSA: Candidate[] = problems
    .filter((problem) => getOverdueDays(progress.problems[problem.id]?.nextReviewAt) > 0)
    .map((problem) => ({
      id: `due-dsa-${problem.id}`,
      blockType: 'dsa_review' as const,
      targetId: problem.id,
      minutes: 8,
      due: true,
      overdueDays: getOverdueDays(progress.problems[problem.id]?.nextReviewAt),
      lastAttemptedAt: progress.problems[problem.id]?.lastAttemptedAt,
      difficulty: normalizeDifficulty(problem.difficulty)
    }));

  const dueSD: Candidate[] = systemDesignPrompts
    .filter((prompt) => getOverdueDays(progress.systemDesign[prompt.id]?.nextReviewAt) > 0)
    .map((prompt) => ({
      id: `due-sd-${prompt.id}`,
      blockType: 'sd_review' as const,
      targetId: prompt.id,
      minutes: 12,
      due: true,
      overdueDays: getOverdueDays(progress.systemDesign[prompt.id]?.nextReviewAt),
      lastAttemptedAt: progress.systemDesign[prompt.id]?.lastAttemptedAt,
      difficulty: normalizeDifficulty(prompt.difficulty)
    }));

  const dueSDDrills: Candidate[] = systemDesignDrills
    .filter((drill) => getOverdueDays(progress.systemDesignDrills[drill.id]?.nextReviewAt) > 0)
    .map((drill) => ({
      id: `due-sd-drill-${drill.id}`,
      blockType: 'sd_drill' as const,
      targetId: drill.id,
      minutes: Math.min(12, Math.max(6, drill.timeLimitMinutes)),
      due: true,
      overdueDays: getOverdueDays(progress.systemDesignDrills[drill.id]?.nextReviewAt),
      lastAttemptedAt: progress.systemDesignDrills[drill.id]?.lastAttemptedAt,
      difficulty: normalizeDifficulty(drill.difficulty)
    }));

  const dueReact: Candidate[] = reactCodingProblems
    .filter((problem) => getOverdueDays(progress.reactCoding[problem.id]?.nextReviewAt) > 0)
    .map((problem) => ({
      id: `due-react-${problem.id}`,
      blockType: 'react_problem' as const,
      targetId: problem.id,
      minutes: 10,
      due: true,
      overdueDays: getOverdueDays(progress.reactCoding[problem.id]?.nextReviewAt),
      lastAttemptedAt: progress.reactCoding[problem.id]?.lastAttemptedAt,
      difficulty: normalizeDifficulty(problem.difficulty),
      weaknessTag: problem.topics.find((topic) => weakestReactTopics.includes(topic))
    }));

  const dsaWeaknessCandidates: Candidate[] = problems
    .filter((problem) => problem.patterns.some((p) => weakestPatterns.includes(p)))
    .map((problem) => ({
      id: `weak-dsa-${problem.id}`,
      blockType: 'dsa_timed_problem' as const,
      targetId: problem.id,
      minutes: 12,
      weaknessTag: problem.patterns.find((p) => weakestPatterns.includes(p)),
      lastAttemptedAt: progress.problems[problem.id]?.lastAttemptedAt,
      difficulty: normalizeDifficulty(problem.difficulty),
      score: progress.problems[problem.id]?.attempts
        ? (progress.problems[problem.id]?.passes ?? 0) / (progress.problems[problem.id]?.attempts ?? 1)
        : 0
    }));

  const drillAttempts = loadDrillAttempts();

  const dsaDrillCandidates: Candidate[] = dsaDrills.map((drill) => ({
    id: `dsa-drill-${drill.id}`,
    blockType: 'dsa_drill' as const,
    targetId: drill.id,
    minutes: Math.min(10, Math.max(5, drill.timeLimitMinutes)),
    difficulty: normalizeDifficulty(drill.difficulty),
    weaknessTag: problems.find((p) => p.id === drill.problemId)?.patterns[0] ?? drill.drillType,
    speedGap: (problems.find((p) => p.id === drill.problemId)?.patterns ?? []).some((tag) => speedGapPatterns.has(tag)),
    confidenceMismatch: (problems.find((p) => p.id === drill.problemId)?.patterns ?? []).some((tag) => overconfidence.has(tag)),
    lastAttemptedAt: drillAttempts
      .filter((attempt) => attempt.drillId === drill.id)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]?.completedAt
  }));

  const sdDrillCandidates: Candidate[] = systemDesignDrills.map((drill) => ({
    id: `sd-drill-${drill.id}`,
    blockType: 'sd_drill' as const,
    targetId: drill.id,
    minutes: Math.min(12, Math.max(6, drill.timeLimitMinutes)),
    difficulty: normalizeDifficulty(drill.difficulty),
    weaknessTag: drill.rubricSubset.categoryIds[0],
    transferGap: sdTransferGap
  }));

  const sdPromptCandidates: Candidate[] = systemDesignPrompts.map((prompt) => ({
    id: `sd-prompt-${prompt.id}`,
    blockType: 'sd_timed_prompt' as const,
    targetId: prompt.id,
    minutes: 15,
    difficulty: normalizeDifficulty(prompt.difficulty),
    weaknessTag: prompt.domain,
    transferGap: sdTransferGap,
    lastAttemptedAt: progress.systemDesign[prompt.id]?.lastAttemptedAt
  }));

  const reactProblemCandidates: Candidate[] = reactCodingProblems.map((problem) => ({
    id: `react-${problem.id}`,
    blockType: 'react_problem' as const,
    targetId: problem.id,
    minutes: 10,
    difficulty: normalizeDifficulty(problem.difficulty),
    weaknessTag: problem.topics.find((topic) => weakestReactTopics.includes(topic)) ?? problem.topics[0],
    lastAttemptedAt: progress.reactCoding[problem.id]?.lastAttemptedAt,
    score: progress.reactCoding[problem.id]?.attempts
      ? (progress.reactCoding[problem.id]?.passes ?? 0) / (progress.reactCoding[problem.id]?.attempts ?? 1)
      : 0
  }));

  return {
    dueDSA,
    dueSD,
    dueSDDrills,
    dueReact,
    dsaWeaknessCandidates,
    dsaDrillCandidates,
    sdDrillCandidates,
    sdPromptCandidates,
    reactProblemCandidates,
    speedGapPatterns,
    weakestPatterns,
    weakestReactTopics
  };
};

export const scoreCandidate = (candidate: Candidate, usedTags: string[]): number => {
  const reviewUrgencyScore = candidate.due ? clamp(candidate.overdueDays ?? 0, 0, 5) : 0;
  const weaknessSeverityScore = candidate.score !== undefined ? clamp((1 - candidate.score) * 3, 0, 3) : 0;
  const speedGapScore = candidate.speedGap ? 2 : 0;
  const transferGapScore = candidate.transferGap ? 2 : 0;
  const confidenceMismatchScore = candidate.confidenceMismatch ? 1.5 : 0;
  const recencyPenaltyScore = (() => {
    if (!candidate.lastAttemptedAt) return 0;
    const days = (Date.now() - new Date(candidate.lastAttemptedAt).getTime()) / dayMs;
    if (days <= 2) return 2;
    if (days <= 7) return 1.5;
    return 0;
  })();
  const repetitionPenaltyScore = candidate.weaknessTag && usedTags.includes(candidate.weaknessTag) ? 1 : 0;
  const repeatTargetPenalty = !candidate.due && candidate.lastAttemptedAt
    ? (Date.now() - new Date(candidate.lastAttemptedAt).getTime()) / dayMs <= 7
      ? 3
      : 0
    : 0;

  return (
    reviewUrgencyScore +
    weaknessSeverityScore +
    speedGapScore +
    transferGapScore +
    confidenceMismatchScore -
    recencyPenaltyScore -
    repetitionPenaltyScore -
    repeatTargetPenalty
  );
};

const pickCandidate = (
  candidates: Candidate[],
  seed: number,
  usedTags: string[],
  opts?: { preferredDifficulty?: Candidate['difficulty']; excludeTag?: string }
) => {
  if (!candidates.length) return null;
  const filtered = opts?.preferredDifficulty ? candidates.filter((c) => c.difficulty === opts.preferredDifficulty) : candidates;
  const pool = filtered.length ? filtered : candidates;
  const withoutTag = opts?.excludeTag ? pool.filter((c) => c.weaknessTag !== opts.excludeTag) : pool;
  const base = withoutTag.length ? withoutTag : pool;
  const scored = base
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, usedTags)
    }))
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));

  const rng = mulberry32(seed);
  const topScore = scored[0].score;
  const topCandidates = scored.filter((item) => item.score === topScore).map((item) => item.candidate);
  const pick = topCandidates[Math.floor(rng() * topCandidates.length)] ?? topCandidates[0];
  return pick ?? scored[0].candidate;
};

const generateRationale = (block: AdaptiveBlock) => {
  if (block.signals.due) {
    return `Overdue review: scheduled due item for ${block.title.toLowerCase()}.`;
  }
  if (block.signals.speedGap && block.signals.weaknessTag) {
    return `Speed gap detected in ${block.signals.weaknessTag}; timed block to build pace.`;
  }
  if (block.signals.transferGap) {
    return 'Transfer gap: drills strong but full designs lag, so this block stitches context.';
  }
  if (block.signals.confidenceMismatch && block.signals.weaknessTag) {
    return `Confidence mismatch in ${block.signals.weaknessTag}; revisit fundamentals with feedback.`;
  }
  if (block.signals.weaknessTag) {
    return `Weakness focus: recent results show ${block.signals.weaknessTag} needs reps.`;
  }
  return 'Balanced practice block to maintain coverage.';
};

const templates: Record<string, Array<Omit<AdaptiveBlock, 'id' | 'title' | 'targetId' | 'rationale' | 'signals'>>> = {
  'dsa-30-interview': [
    { blockType: 'dsa_drill', minutes: 8, timed: true, userEditable: true },
    { blockType: 'dsa_drill', minutes: 8, timed: true, userEditable: true },
    { blockType: 'dsa_timed_problem', minutes: 12, timed: true, userEditable: true },
    { blockType: 'reflection', minutes: 2, timed: false, userEditable: false }
  ],
  'dsa-30-chill': [
    { blockType: 'dsa_review', minutes: 8, timed: false, userEditable: true },
    { blockType: 'dsa_drill', minutes: 8, timed: false, userEditable: true },
    { blockType: 'dsa_timed_problem', minutes: 10, timed: false, userEditable: true },
    { blockType: 'reflection', minutes: 4, timed: false, userEditable: false }
  ],
  'sd-45-interview': [
    { blockType: 'sd_drill', minutes: 10, timed: true, userEditable: true },
    { blockType: 'sd_drill', minutes: 10, timed: true, userEditable: true },
    { blockType: 'sd_timed_prompt', minutes: 20, timed: true, userEditable: true },
    { blockType: 'reflection', minutes: 5, timed: false, userEditable: false }
  ],
  'sd-45-chill': [
    { blockType: 'sd_review', minutes: 12, timed: false, userEditable: true },
    { blockType: 'sd_drill', minutes: 12, timed: false, userEditable: true },
    { blockType: 'sd_timed_prompt', minutes: 16, timed: false, userEditable: true },
    { blockType: 'reflection', minutes: 5, timed: false, userEditable: false }
  ],
  'mixed-60-interview': [
    { blockType: 'dsa_drill', minutes: 8, timed: true, userEditable: true },
    { blockType: 'react_problem', minutes: 10, timed: true, userEditable: true },
    { blockType: 'sd_drill', minutes: 10, timed: true, userEditable: true },
    { blockType: 'sd_timed_prompt', minutes: 20, timed: true, userEditable: true },
    { blockType: 'reflection', minutes: 10, timed: false, userEditable: false }
  ],
  'mixed-60-chill': [
    { blockType: 'dsa_review', minutes: 8, timed: false, userEditable: true },
    { blockType: 'react_problem', minutes: 12, timed: false, userEditable: true },
    { blockType: 'sd_review', minutes: 12, timed: false, userEditable: true },
    { blockType: 'sd_drill', minutes: 12, timed: false, userEditable: true },
    { blockType: 'reflection', minutes: 10, timed: false, userEditable: false }
  ]
};

const fallbackTemplate = (mode: AdaptiveMode, lengthMinutes: number, intensity: AdaptiveIntensity) => {
  const key = `${mode}-${lengthMinutes}-${intensity}`;
  if (templates[key]) return templates[key];
  const base = templates[`${mode}-30-${intensity}`] ?? templates[`${mode}-45-${intensity}`];
  return base ?? templates['dsa-30-chill'];
};

export const generateAdaptivePlan = (inputs: PlannerInputs): AdaptiveSessionPlan => {
  const { mode, lengthMinutes, intensity, seed, progress } = inputs;
  const pools = buildCandidatePools(progress);
  const dsaStats = buildDSAProblemStats(progress);
  const drillStats = buildDSASpeedDrillStats();
  const sdDrillStats = buildSystemDesignDrillStats(progress);
  const reactStats = buildReactCodingStats(progress);

  const dominantDSA = determineDSAFailureMode(dsaStats, drillStats);
  const dominantSD = determineSDFailureMode(sdDrillStats);
  let template = fallbackTemplate(mode, lengthMinutes, intensity);
  const hasReview = template.some((block) => block.blockType === 'dsa_review' || block.blockType === 'sd_review');
  const hasDue = pools.dueDSA.length + pools.dueSD.length + pools.dueSDDrills.length + pools.dueReact.length > 0;
  if (intensity === 'chill' && hasDue && !hasReview) {
    template = [{ blockType: mode === 'dsa' ? 'dsa_review' : 'sd_review', minutes: 8, timed: false, userEditable: true }, ...template.slice(1)];
  }

  const dsaAvg = avg(dsaStats.map((s) => s.score));
  const sdAvg = avg(sdDrillStats.map((s) => s.score));
  const reactAvg = avg(reactStats.map((s) => s.score));
  const startDSADifficulty: Candidate['difficulty'] = dsaAvg <= 0.5 ? 'easy' : 'medium';
  const startSDDifficulty: Candidate['difficulty'] = sdAvg <= 0.5 ? 'easy' : 'medium';
  const startReactDifficulty: Candidate['difficulty'] = reactAvg <= 0.5 ? 'easy' : 'medium';
  const includeHardDSA = dsaAvg >= 0.8;
  const includeHardSD = sdAvg >= 0.8;
  const includeHardReact = reactAvg >= 0.8;

  const usedTags: string[] = [];
  let counter = 0;
  let dsaBlockIndex = 0;
  let sdBlockIndex = 0;
  let reactBlockIndex = 0;

  const getExcludeTag = () => {
    if (usedTags.length < 2) return undefined;
    const last = usedTags[usedTags.length - 1];
    const prev = usedTags[usedTags.length - 2];
    return last && last === prev ? last : undefined;
  };

  const blocks: AdaptiveBlock[] = template.map((slot) => {
    let candidate: Candidate | null = null;
    if (slot.blockType === 'dsa_review') {
      const isFirst = dsaBlockIndex === 0;
      candidate = pickCandidate(pools.dueDSA, seed + counter, usedTags) ?? pickCandidate(pools.dsaWeaknessCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startDSADifficulty : undefined, excludeTag: getExcludeTag() });
      dsaBlockIndex += 1;
    }
    if (slot.blockType === 'dsa_drill') {
      const isFirst = dsaBlockIndex === 0;
      candidate = pickCandidate(pools.dsaDrillCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startDSADifficulty : undefined, excludeTag: getExcludeTag() });
      dsaBlockIndex += 1;
    }
    if (slot.blockType === 'dsa_timed_problem') {
      const isFirst = dsaBlockIndex === 0;
      candidate = pickCandidate(pools.dsaWeaknessCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startDSADifficulty : includeHardDSA ? 'hard' : undefined, excludeTag: getExcludeTag() }) ?? pickCandidate(pools.dueDSA, seed + counter, usedTags);
      dsaBlockIndex += 1;
    }
    if (slot.blockType === 'react_problem') {
      const isFirst = reactBlockIndex === 0;
      candidate =
        pickCandidate(pools.dueReact, seed + counter, usedTags) ??
        pickCandidate(pools.reactProblemCandidates, seed + counter, usedTags, {
          preferredDifficulty: isFirst ? startReactDifficulty : includeHardReact ? 'hard' : undefined,
          excludeTag: getExcludeTag()
        });
      reactBlockIndex += 1;
    }
    if (slot.blockType === 'sd_review') {
      const isFirst = sdBlockIndex === 0;
      candidate = pickCandidate(pools.dueSD, seed + counter, usedTags) ?? pickCandidate(pools.sdPromptCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startSDDifficulty : undefined, excludeTag: getExcludeTag() });
      sdBlockIndex += 1;
    }
    if (slot.blockType === 'sd_drill') {
      const isFirst = sdBlockIndex === 0;
      candidate = pickCandidate(pools.sdDrillCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startSDDifficulty : undefined, excludeTag: getExcludeTag() });
      sdBlockIndex += 1;
    }
    if (slot.blockType === 'sd_timed_prompt') {
      const isFirst = sdBlockIndex === 0;
      candidate = pickCandidate(pools.sdPromptCandidates, seed + counter, usedTags, { preferredDifficulty: isFirst ? startSDDifficulty : includeHardSD ? 'hard' : undefined, excludeTag: getExcludeTag() });
      sdBlockIndex += 1;
    }
    if (!candidate) {
      candidate = {
        id: `fallback-${slot.blockType}`,
        blockType: slot.blockType,
        targetId:
          slot.blockType === 'react_problem'
            ? reactCodingProblems[0]?.id ?? 'react'
            : mode === 'system-design'
            ? systemDesignPrompts[0]?.id ?? 'sd'
            : problems[0]?.id ?? 'dsa',
        minutes: slot.minutes
      };
    }
    if (candidate.weaknessTag) {
      usedTags.push(candidate.weaknessTag);
    }
    const title = (() => {
      if (slot.blockType.startsWith('dsa')) {
        const problem = problems.find((p) => p.id === candidate.targetId);
        return problem?.title ?? candidate.targetId;
      }
      if (slot.blockType === 'react_problem') {
        const problem = reactCodingProblems.find((p) => p.id === candidate.targetId);
        return problem?.title ?? candidate.targetId;
      }
      if (slot.blockType.startsWith('sd')) {
        const prompt = systemDesignPrompts.find((p) => p.id === candidate.targetId);
        const drill = systemDesignDrills.find((d) => d.id === candidate.targetId);
        return prompt?.title ?? drill?.title ?? candidate.targetId;
      }
      return 'Reflection';
    })();
    const block: AdaptiveBlock = {
      id: `${toId(slot.blockType)}-${candidate.targetId}-${counter}`,
      blockType: slot.blockType,
      targetId: candidate.targetId,
      minutes: slot.minutes,
      timed: slot.timed,
      userEditable: slot.userEditable,
      title,
      signals: {
        due: candidate.due,
        weaknessTag: candidate.weaknessTag,
        speedGap: candidate.speedGap,
        transferGap: candidate.transferGap,
        confidenceMismatch: candidate.confidenceMismatch
      },
      rationale: ''
    };
    block.rationale = generateRationale(block);
    counter += 1;
    return block;
  });

  const summary = {
    primaryFocus: [mode === 'dsa' ? dominantDSA : dominantSD],
    dueReviewCount: pools.dueDSA.length + pools.dueSD.length + pools.dueSDDrills.length + pools.dueReact.length,
    estimatedTotalMinutes: blocks.reduce((acc, block) => acc + block.minutes, 0)
  };

  return {
    id: `adaptive-${Date.now()}-${seed}`,
    createdAt: Date.now(),
    mode,
    lengthMinutes,
    intensity,
    seed,
    blocks,
    summary
  };
};

export const getReplacementCandidates = (
  blockType: AdaptiveBlock['blockType'],
  progress: ProgressState,
  weaknessTag?: string
) => {
  const pools = buildCandidatePools(progress);
  const candidates: Candidate[] = [];
  if (blockType === 'dsa_review') candidates.push(...pools.dueDSA, ...pools.dsaWeaknessCandidates);
  if (blockType === 'dsa_drill') candidates.push(...pools.dsaDrillCandidates);
  if (blockType === 'dsa_timed_problem') candidates.push(...pools.dsaWeaknessCandidates);
  if (blockType === 'react_problem') candidates.push(...pools.dueReact, ...pools.reactProblemCandidates);
  if (blockType === 'sd_review') candidates.push(...pools.dueSD);
  if (blockType === 'sd_drill') candidates.push(...pools.sdDrillCandidates);
  if (blockType === 'sd_timed_prompt') candidates.push(...pools.sdPromptCandidates);

  const filtered = weaknessTag ? candidates.filter((c) => c.weaknessTag === weaknessTag) : candidates;
  return filtered.map((candidate) => ({
    id: candidate.id,
    targetId: candidate.targetId,
    title: candidate.targetId
  }));
};
