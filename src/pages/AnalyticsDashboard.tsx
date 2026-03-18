import { useAppStore } from '../store/useAppStore';
import {
  buildDSAProblemStats,
  buildDSASpeedDrillStats,
  buildSystemDesignDrillStats,
  buildMockInterviewStats,
  buildQuizStats,
  buildReactCodingStats,
  buildReactDebuggingStats,
  buildUnitTestingStats,
  generateInsights
} from '../lib/analytics/engine';

const AnalyticsDashboard = () => {
  const progress = useAppStore((state) => state.progress);
  const dsaStats = buildDSAProblemStats(progress);
  const drillStats = buildDSASpeedDrillStats();
  const sdDrillStats = buildSystemDesignDrillStats(progress);
  const mockStats = buildMockInterviewStats();
  const quizStats = buildQuizStats(progress);
  const reactStats = buildReactCodingStats(progress);
  const reactDebuggingStats = buildReactDebuggingStats(progress);
  const unitTestingStats = buildUnitTestingStats(progress);
  const insights = generateInsights(dsaStats, drillStats, sdDrillStats, mockStats);

  const patterns = Array.from(new Set(dsaStats.flatMap((s) => s.patterns)));
  const patternMetrics = patterns.map((pattern) => {
    const dsaPattern = dsaStats.filter((s) => s.patterns.includes(pattern));
    const drillPattern = drillStats.filter((s) => s.patterns.includes(pattern));
    const accuracy = dsaPattern.length ? dsaPattern.reduce((a, b) => a + b.score, 0) / dsaPattern.length : 0;
    const speed = drillPattern.length ? drillPattern.filter((s) => s.passed).length / drillPattern.length : 0;
    const transfer = speed > 0 ? Math.min(accuracy, speed) : 0;
    return { pattern, accuracy, speed, transfer };
  });
  const rubricCoverage: Record<string, number[]> = {};
  sdDrillStats.forEach((stat) => {
    stat.rubricCategories.forEach((cat) => {
      rubricCoverage[cat] = rubricCoverage[cat] ?? [];
      rubricCoverage[cat].push(stat.score);
    });
  });
  const mockPhaseScores: Record<string, number[]> = {};
  const mockPhaseTimes: Record<string, number[]> = {};
  mockStats.forEach((stat) => {
    Object.entries(stat.phaseScores).forEach(([phase, score]) => {
      mockPhaseScores[phase] = mockPhaseScores[phase] ?? [];
      mockPhaseScores[phase].push(score);
    });
    Object.entries(stat.phaseDurations).forEach(([phase, duration]) => {
      mockPhaseTimes[phase] = mockPhaseTimes[phase] ?? [];
      mockPhaseTimes[phase].push(duration);
    });
  });

  const quizBySubtopic: Record<string, { total: number; correct: number }> = {};
  quizStats.forEach((stat) => {
    if (stat.attempts === 0) return;
    const entry = quizBySubtopic[stat.subtopic] ?? { total: 0, correct: 0 };
    entry.total += stat.attempts;
    entry.correct += stat.correctCount;
    quizBySubtopic[stat.subtopic] = entry;
  });

  const reactTopicStats: Record<string, { attempts: number; passes: number; times: number[] }> = {};
  reactStats.forEach((stat) => {
    stat.topics.forEach((topic) => {
      const entry = reactTopicStats[topic] ?? { attempts: 0, passes: 0, times: [] };
      entry.attempts += stat.attempts;
      entry.passes += stat.passes;
      if (stat.timeToPassSeconds !== undefined) entry.times.push(stat.timeToPassSeconds);
      reactTopicStats[topic] = entry;
    });
  });
  const debuggingByBugType: Record<string, { attempts: number; passes: number; firstTimes: number[]; totalTimes: number[] }> = {};
  reactDebuggingStats.forEach((stat) => {
    stat.bugTypes.forEach((bugType) => {
      const entry = debuggingByBugType[bugType] ?? { attempts: 0, passes: 0, firstTimes: [], totalTimes: [] };
      entry.attempts += stat.attempts;
      entry.passes += stat.passes;
      if (stat.timeToFirstVisiblePassSeconds !== undefined) entry.firstTimes.push(stat.timeToFirstVisiblePassSeconds);
      if (stat.totalSolveTimeSeconds !== undefined) entry.totalTimes.push(stat.totalSolveTimeSeconds);
      debuggingByBugType[bugType] = entry;
    });
  });
  const unitTestingByTopic: Record<string, { attempts: number; passes: number; weakFailures: number; solveTimes: number[] }> = {};
  unitTestingStats.forEach((stat) => {
    stat.topics.forEach((topic) => {
      const entry = unitTestingByTopic[topic] ?? { attempts: 0, passes: 0, weakFailures: 0, solveTimes: [] };
      entry.attempts += stat.attempts;
      entry.passes += stat.passes;
      entry.weakFailures += stat.weakFailure ? 1 : 0;
      if (stat.totalSolveTimeSeconds !== undefined) entry.solveTimes.push(stat.totalSolveTimeSeconds);
      unitTestingByTopic[topic] = entry;
    });
  });

  return (
    <div className="space-y-8">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-2 text-sm text-mist-200">Cross-mode insights and next steps based on your results.</p>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Interview Readiness Summary</h2>
        {insights.length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough data yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-mist-200">
            {insights.map((insight) => (
              <li key={insight.id}>
                <strong>{insight.title}</strong> — {insight.detail}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Pattern Heatmap</h2>
        {patternMetrics.length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough data yet.</p>
        ) : (
          <table className="mt-3 w-full text-xs text-mist-200">
            <thead>
              <tr className="text-mist-300">
                <th className="text-left">Pattern</th>
                <th>Speed</th>
                <th>Accuracy</th>
                <th>Transfer</th>
              </tr>
            </thead>
            <tbody>
              {patternMetrics.map((row) => (
                <tr key={row.pattern} className="border-t border-white/10">
                  <td className="py-2">{row.pattern}</td>
                  <td className="text-center">{Math.round(row.speed * 100)}%</td>
                  <td className="text-center">{Math.round(row.accuracy * 100)}%</td>
                  <td className="text-center">{Math.round(row.transfer * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">System Design Coverage</h2>
        {sdDrillStats.length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(rubricCoverage).map(([cat, scores]) => (
              <div key={cat} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                <span>{cat}</span>
                <span>{Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Quiz Accuracy by Subtopic</h2>
        {Object.keys(quizBySubtopic).length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough quiz data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(quizBySubtopic).map(([subtopic, stats]) => (
              <div key={subtopic} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                <span>{subtopic}</span>
                <span>{Math.round((stats.correct / stats.total) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">React Coding Topic Accuracy</h2>
        {Object.keys(reactTopicStats).length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough React coding data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(reactTopicStats).map(([topic, stats]) => {
              const accuracy = stats.attempts ? stats.passes / stats.attempts : 0;
              const avgTime = stats.times.length
                ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length)
                : null;
              return (
                <div key={topic} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                  <span>{topic}</span>
                  <span>{Math.round(accuracy * 100)}%</span>
                  <span>{avgTime !== null ? `${avgTime}s avg` : 'n/a'}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">React Debugging Bug-Type Stats</h2>
        {Object.keys(debuggingByBugType).length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough React debugging data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(debuggingByBugType).map(([bugType, stats]) => {
              const passRate = stats.attempts ? Math.round((stats.passes / stats.attempts) * 100) : 0;
              const avgFirst = stats.firstTimes.length
                ? Math.round(stats.firstTimes.reduce((a, b) => a + b, 0) / stats.firstTimes.length)
                : null;
              const avgTotal = stats.totalTimes.length
                ? Math.round(stats.totalTimes.reduce((a, b) => a + b, 0) / stats.totalTimes.length)
                : null;
              return (
                <div key={bugType} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                  <span>{bugType}</span>
                  <span>{passRate}% pass rate</span>
                  <span>{avgFirst !== null ? `${avgFirst}s to visible pass` : 'n/a'}</span>
                  <span>{avgTotal !== null ? `${avgTotal}s total` : 'n/a'}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Unit Testing Topic Stats</h2>
        {Object.keys(unitTestingByTopic).length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough Unit Testing Gym data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(unitTestingByTopic).map(([topic, stats]) => {
              const passRate = stats.attempts ? Math.round((stats.passes / stats.attempts) * 100) : 0;
              const avgSolve = stats.solveTimes.length ? Math.round(stats.solveTimes.reduce((a, b) => a + b, 0) / stats.solveTimes.length) : null;
              return (
                <div key={topic} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                  <span>{topic}</span>
                  <span>{passRate}% pass rate</span>
                  <span>{stats.weakFailures} weak failures</span>
                  <span>{avgSolve !== null ? `${avgSolve}s avg solve` : 'n/a'}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Mock Interview Breakdown</h2>
        {mockStats.length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Not enough data yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 text-xs text-mist-200">
            {Object.entries(mockPhaseScores).map(([phase, scores]) => (
              <div key={phase} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                <span>{phase}</span>
                <span>Score {Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)}%</span>
                <span>
                  Time {Math.round((mockPhaseTimes[phase]?.reduce((a, b) => a + b, 0) / (mockPhaseTimes[phase]?.length || 1)))}s
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Recommended Next Actions</h2>
        {insights.length === 0 ? (
          <p className="mt-3 text-sm text-mist-300">Complete more drills to see recommendations.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-mist-200">
            {insights.slice(0, 3).map((insight) => (
              <li key={insight.id}>{insight.recommendation}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
