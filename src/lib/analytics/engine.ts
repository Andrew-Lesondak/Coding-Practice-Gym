import { problems } from '../../data/problems';
import { quizQuestions } from '../../data/quizzes';
import { systemDesignDrills } from '../../data/systemDesignDrills';
import { loadDrillAttempts } from '../dsaDrillStorage';
import { loadMockSessions } from '../mockInterviewStorage';
import { patternToRubricCategory } from './mappings';
import {
  DSAProblemStats,
  DSASpeedDrillStats,
  SystemDesignDrillStats,
  MockInterviewStats,
  Insight,
  QuizStats
} from './types';
import { ProgressState } from '../../types/progress';

const avg = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export const buildDSAProblemStats = (progress: ProgressState): DSAProblemStats[] => {
  return problems
    .map((problem) => {
      const p = progress.problems[problem.id];
      if (!p) return null;
      return {
        id: problem.id,
        patterns: problem.patterns,
        attempts: p.attempts,
        passes: p.passes,
        lastAttemptedAt: p.lastAttemptedAt,
        lastPassedAt: p.lastPassedAt,
        score: p.attempts ? p.passes / p.attempts : 0,
        confidence: p.lastRating?.confidence
      };
    })
    .filter(Boolean) as DSAProblemStats[];
};

export const buildDSASpeedDrillStats = (): DSASpeedDrillStats[] => {
  const attempts = loadDrillAttempts();
  return attempts.map((attempt) => {
    const problem = problems.find((p) => p.id === attempt.problemId);
    return {
      drillId: attempt.drillId,
      problemId: attempt.problemId,
      drillType: attempt.drillType,
      difficulty: attempt.difficulty,
      patterns: problem?.patterns ?? [],
      completedAt: attempt.completedAt,
      durationSeconds: attempt.durationSeconds,
      passed: attempt.passed,
      confidence: attempt.confidence
    };
  });
};

export const buildSystemDesignDrillStats = (progress: ProgressState): SystemDesignDrillStats[] => {
  return systemDesignDrills
    .map((drill) => {
      const p = progress.systemDesignDrills[drill.id];
      if (!p || p.lastScore === undefined) return null;
      return {
        drillId: drill.id,
        score: p.lastScore ?? 0,
        lastAttemptedAt: p.lastAttemptedAt,
        confidence: p.confidence,
        rubricCategories: drill.rubricSubset.categoryIds
      };
    })
    .filter(Boolean) as SystemDesignDrillStats[];
};

export const buildMockInterviewStats = (): MockInterviewStats[] => {
  return loadMockSessions().map((session) => ({
    sessionId: session.id,
    promptId: session.promptId,
    completedAt: session.completedAt,
    phaseScores: session.scores?.drillScores ?? {},
    phaseDurations: session.phaseDurations ?? {},
    confidence: session.confidenceRating
  }));
};

export const buildQuizStats = (progress: ProgressState): QuizStats[] => {
  return quizQuestions.map((question) => {
    const p = progress.quizzes[question.id];
    const attempts = p?.attempts ?? 0;
    const correctCount = p?.correctCount ?? 0;
    return {
      questionId: question.id,
      topic: question.topic,
      subtopic: question.subtopic,
      attempts,
      correctCount,
      accuracy: attempts ? correctCount / attempts : 0,
      lastAnsweredAt: p?.lastAnsweredAt
    };
  });
};

export const generateInsights = (
  dsaStats: DSAProblemStats[],
  drillStats: DSASpeedDrillStats[],
  sdDrillStats: SystemDesignDrillStats[],
  mockStats: MockInterviewStats[]
): Insight[] => {
  const insights: Insight[] = [];

  // Speed vs Accuracy
  const patternStats = new Map<string, { accuracy: number[]; drillPass: number[] }>();
  dsaStats.forEach((stat) => {
    stat.patterns.forEach((pattern) => {
      const entry = patternStats.get(pattern) ?? { accuracy: [], drillPass: [] };
      entry.accuracy.push(stat.score);
      patternStats.set(pattern, entry);
    });
  });
  drillStats.forEach((stat) => {
    stat.patterns.forEach((pattern) => {
      const entry = patternStats.get(pattern) ?? { accuracy: [], drillPass: [] };
      entry.drillPass.push(stat.passed ? 1 : 0);
      patternStats.set(pattern, entry);
    });
  });
  patternStats.forEach((value, pattern) => {
    const accuracy = avg(value.accuracy);
    const drillPass = avg(value.drillPass);
    if (accuracy >= 0.7 && drillPass > 0 && drillPass <= 0.5) {
      insights.push({
        id: `speed-${pattern}`,
        title: `Strong correctness but slow execution in ${pattern}`,
        detail: `Accuracy ${Math.round(accuracy * 100)}% vs drill pass ${Math.round(drillPass * 100)}%.`,
        recommendation: `Redo ${pattern} speed drills and focus on core loop timing.`,
        data: { pattern, accuracy, drillPass }
      });
    }
  });

  // Pattern -> Architecture correlation
  const rubricScoreByCategory: Record<string, number[]> = {};
  sdDrillStats.forEach((stat) => {
    stat.rubricCategories.forEach((category) => {
      rubricScoreByCategory[category] = rubricScoreByCategory[category] ?? [];
      rubricScoreByCategory[category].push(stat.score);
    });
  });
  patternStats.forEach((value, pattern) => {
    const category = patternToRubricCategory[pattern];
    if (!category) return;
    const accuracy = avg(value.accuracy);
    const categoryScore = avg(rubricScoreByCategory[category] ?? []);
    if (accuracy > 0 && categoryScore > 0 && accuracy <= 0.5 && categoryScore <= 0.5) {
      insights.push({
        id: `corr-${pattern}-${category}`,
        title: `Weak ${pattern} correlates with ${category} rubric misses`,
        detail: `Pattern accuracy ${Math.round(accuracy * 100)}%, rubric ${Math.round(categoryScore * 100)}%.`,
        recommendation: `Redo drills focused on ${category} (system design) and ${pattern} (DSA).`,
        data: { pattern, category, accuracy, categoryScore }
      });
    }
  });

  // Interview phase breakdown
  if (mockStats.length > 0) {
    const phaseScores: Record<string, number[]> = {};
    mockStats.forEach((stat) => {
      Object.entries(stat.phaseScores).forEach(([phase, score]) => {
        phaseScores[phase] = phaseScores[phase] ?? [];
        phaseScores[phase].push(score);
      });
    });
    const weakest = Object.entries(phaseScores)
      .map(([phase, scores]) => ({ phase, score: avg(scores) }))
      .sort((a, b) => a.score - b.score)[0];
    if (weakest) {
      insights.push({
        id: `mock-weakest-${weakest.phase}`,
        title: `Mock interview weakest phase: ${weakest.phase}`,
        detail: `Average phase score ${Math.round(weakest.score * 100)}%.`,
        recommendation: `Redo drills aligned with ${weakest.phase}.`,
        data: weakest
      });
    }
  }

  // Transfer effectiveness
  if (sdDrillStats.length > 0 && mockStats.length > 0) {
    const drillAvg = avg(sdDrillStats.map((stat) => stat.score));
    const mockAvg = avg(mockStats.map((stat) => avg(Object.values(stat.phaseScores))));
    if (drillAvg >= 0.7 && mockAvg > 0 && mockAvg <= 0.5) {
      insights.push({
        id: 'transfer-failure',
        title: 'Transfer gap from drills to mock interviews',
        detail: `Drill avg ${Math.round(drillAvg * 100)}% vs mock avg ${Math.round(mockAvg * 100)}%.`,
        recommendation: 'Run a full mock interview and focus on stitching phases together.',
        data: { drillAvg, mockAvg }
      });
    }
  }

  // Confidence calibration
  const confidencePairs = [
    ...dsaStats.filter((s) => s.confidence).map((s) => ({ confidence: s.confidence as number, score: s.score })),
    ...drillStats.map((s) => ({ confidence: s.confidence, score: s.passed ? 1 : 0 })),
    ...sdDrillStats.filter((s) => s.confidence).map((s) => ({ confidence: s.confidence as number, score: s.score })),
    ...mockStats.filter((s) => s.confidence).map((s) => ({ confidence: s.confidence as number, score: avg(Object.values(s.phaseScores)) }))
  ];
  if (confidencePairs.length > 0) {
    const avgConfidence = avg(confidencePairs.map((c) => c.confidence));
    const avgScore = avg(confidencePairs.map((c) => c.score));
    if (avgConfidence >= 4 && avgScore <= 0.5) {
      insights.push({
        id: 'overconfidence',
        title: 'Overconfidence trend detected',
        detail: `Confidence avg ${avgConfidence.toFixed(1)} vs performance ${Math.round(avgScore * 100)}%.`,
        recommendation: 'Add more timed drills and post-mortem reviews.',
        data: { avgConfidence, avgScore }
      });
    } else if (avgConfidence <= 2 && avgScore >= 0.7) {
      insights.push({
        id: 'underconfidence',
        title: 'Underconfidence trend detected',
        detail: `Confidence avg ${avgConfidence.toFixed(1)} vs performance ${Math.round(avgScore * 100)}%.`,
        recommendation: 'Attempt more mock interviews to build confidence.',
        data: { avgConfidence, avgScore }
      });
    }
  }

  return insights;
};
