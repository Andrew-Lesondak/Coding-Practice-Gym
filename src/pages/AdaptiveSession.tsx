import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CodeEditor from '../components/CodeEditor';
import StepList from '../components/StepList';
import TestResults from '../components/TestResults';
import SystemDesignRubric from '../components/SystemDesignRubric';
import { AdaptiveBlock, AdaptiveBlockOutcome, AdaptiveSessionRun } from '../types/adaptive';
import { getAdaptivePlan, saveAdaptiveRun, loadAdaptiveRuns } from '../lib/adaptiveStorage';
import { problems } from '../data/problems';
import { dsaDrills } from '../data/dsaDrills';
import { systemDesignPrompts } from '../data/systemDesignPrompts';
import { systemDesignDrills } from '../data/systemDesignDrills';
import { parseEditRegions, isEditAllowed } from '../lib/dsaDrillEditRegions';
import { runInWorker, RunResponse } from '../lib/runnerClient';
import { getDrillTests } from '../lib/dsaDrillRunner';
import { computeDesignStepStatus, parseDesignSteps } from '../lib/systemDesignStub';
import { computeScore } from '../lib/systemDesignRubric';
import { useAppStore, getProblemProgress, getSystemDesignProgress, getSystemDesignDrillProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { saveDrillAttempt } from '../lib/dsaDrillStorage';

const useBlockTimer = (minutes: number, active: boolean, onTimeout: () => void) => {
  const [remaining, setRemaining] = useState(minutes * 60);
  useEffect(() => {
    if (!active) return;
    setRemaining(minutes * 60);
  }, [minutes, active]);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, onTimeout]);
  return remaining;
};

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const AdaptiveSession = () => {
  const { sessionId } = useParams();
  const plan = sessionId ? getAdaptivePlan(sessionId) : null;
  const progress = useAppStore((state) => state.progress);
  const updateProblemProgress = useAppStore((state) => state.updateProblemProgress);
  const updateSystemDesignProgress = useAppStore((state) => state.updateSystemDesignProgress);
  const updateSystemDesignDrillProgress = useAppStore((state) => state.updateSystemDesignDrillProgress);
  const [blockIndex, setBlockIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [runResult, setRunResult] = useState<RunResponse | undefined>();
  const [code, setCode] = useState('');
  const [designText, setDesignText] = useState('');
  const [rubricChecks, setRubricChecks] = useState<Record<string, boolean>>({});
  const [patternText, setPatternText] = useState('');
  const [explainText, setExplainText] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [sessionRun, setSessionRun] = useState<AdaptiveSessionRun | null>(null);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const prevCodeRef = useRef('');

  const block = plan?.blocks[blockIndex];

  const remaining = useBlockTimer(block?.minutes ?? 0, started && block?.timed === true, () => {
    setLocked(true);
  });

  useEffect(() => {
    if (!plan) return;
    setSessionRun({
      sessionId: `run-${plan.id}`,
      planId: plan.id,
      startedAt: new Date().toISOString(),
      outcomes: []
    });
  }, [plan]);

  useEffect(() => {
    if (!block) return;
    setLocked(false);
    setStarted(false);
    setAutoCompleted(false);
    setRunResult(undefined);
    setPatternText('');
    setExplainText('');
    setConfidence(3);

    if (block.blockType.startsWith('dsa')) {
      const drill = dsaDrills.find((d) => d.id === block.targetId);
      const problem = problems.find((p) => p.id === block.targetId) ?? problems.find((p) => p.id === drill?.problemId);
      const starter = drill?.starterCode ?? problem?.guidedStub ?? '';
      setCode(starter);
      prevCodeRef.current = starter;
    }
    if (block.blockType.startsWith('sd')) {
      const drill = systemDesignDrills.find((d) => d.id === block.targetId);
      const prompt = systemDesignPrompts.find((p) => p.id === block.targetId);
      setDesignText(drill?.starterTemplateMarkdown ?? prompt?.guidedDesignStubMarkdown ?? '');
      setRubricChecks({});
    }
  }, [block?.id]);

  if (!plan || !block) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Adaptive session not found.</p>
        <Link className="text-sm text-ember-400" to="/adaptive">Back to planner</Link>
      </div>
    );
  }

  const isComplete = Boolean(sessionRun?.completedAt);
  if (isComplete && sessionRun) {
    const outcomes = sessionRun.outcomes;
    const totalBlocks = plan.blocks.length;
    const completionRate = totalBlocks ? outcomes.length / totalBlocks : 0;
    const scores = outcomes
      .map((o) => (o.score !== undefined ? o.score : o.pass !== undefined ? (o.pass ? 1 : 0) : null))
      .filter((v): v is number => v !== null);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const avgTime = outcomes.length ? outcomes.reduce((a, b) => a + b.timeUsedSeconds, 0) / outcomes.length : 0;
    const previous = loadAdaptiveRuns()
      .filter((run) => run.sessionId !== sessionRun.sessionId && run.completedAt)
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0];
    let improvementText = 'No prior session data to compare.';
    if (previous) {
      const prevScores = previous.outcomes
        .map((o) => (o.score !== undefined ? o.score : o.pass !== undefined ? (o.pass ? 1 : 0) : null))
        .filter((v): v is number => v !== null);
      const prevAvg = prevScores.length ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : 0;
      const delta = avgScore - prevAvg;
      improvementText = delta === 0 ? 'Performance matched your last session.' : delta > 0 ? `Improved by ${Math.round(delta * 100)}%.` : `Down by ${Math.round(Math.abs(delta) * 100)}% from last session.`;
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Adaptive Session</p>
          <h1 className="font-display text-2xl font-semibold">Session Summary</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Completion rate</p>
            <p className="text-2xl font-semibold">{Math.round(completionRate * 100)}%</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Avg score</p>
            <p className="text-2xl font-semibold">{Math.round(avgScore * 100)}%</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Avg time</p>
            <p className="text-2xl font-semibold">{Math.round(avgTime / 60)} min</p>
          </div>
        </div>
        <p className="text-sm text-mist-200">{improvementText}</p>
        <Link className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" to="/adaptive">
          Generate next session
        </Link>
      </div>
    );
  }

  const onStart = () => setStarted(true);

  const completeBlock = (outcome: AdaptiveBlockOutcome) => {
    if (!sessionRun) return;
    const nextRun = {
      ...sessionRun,
      outcomes: [...sessionRun.outcomes.filter((o) => o.blockId !== outcome.blockId), outcome]
    };
    if (blockIndex === plan.blocks.length - 1) {
      nextRun.completedAt = new Date().toISOString();
    }
    setSessionRun(nextRun);
    saveAdaptiveRun(nextRun);
    if (blockIndex < plan.blocks.length - 1) {
      setBlockIndex((prev) => prev + 1);
    }
  };

  const handleOutcome = (payload: { pass?: boolean; score?: number }) => {
    completeBlock({
      blockId: block.id,
      targetId: block.targetId,
      blockType: block.blockType,
      completedAt: new Date().toISOString(),
      timeUsedSeconds: block.minutes * 60 - remaining,
      pass: payload.pass,
      score: payload.score,
      confidence
    });
  };

  const runTests = async () => {
    const drill = dsaDrills.find((d) => d.id === block.targetId);
    const problem = problems.find((p) => p.id === block.targetId) ?? problems.find((p) => p.id === drill?.problemId);
    if (!problem) return;
    const tests = drill ? getDrillTests(problem, drill) : problem.tests.visible;
    const result = await runInWorker({
      code,
      functionName: problem.functionName,
      tests,
      language: 'ts',
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat
    });
    setRunResult(result);
    return result;
  };

  const finalizeDSA = (result?: RunResponse) => {
    const drill = dsaDrills.find((d) => d.id === block.targetId);
    const problem = problems.find((p) => p.id === block.targetId) ?? problems.find((p) => p.id === drill?.problemId);
    const finalResult = result ?? runResult;
    if (problem) {
      const current = getProblemProgress(progress, problem.id);
      const next = {
        ...current,
        attempts: current.attempts + 1,
        passes: current.passes + (finalResult?.ok ? 1 : 0),
        lastAttemptedAt: new Date().toISOString()
      };
      if (finalResult?.ok) {
        updateProblemProgress(problem.id, updateScheduleGeneric(next, 3, confidence));
      } else {
        updateProblemProgress(problem.id, next);
      }
    }
    if (drill) {
      saveDrillAttempt({
        drillId: drill.id,
        problemId: drill.problemId,
        drillType: drill.drillType,
        difficulty: drill.difficulty,
        completedAt: new Date().toISOString(),
        durationSeconds: Math.max(0, block.minutes * 60 - remaining),
        passed: finalResult?.ok ?? false,
        confidence
      });
    }
    handleOutcome({ pass: finalResult?.ok ?? false });
  };

  const finalizeSD = () => {
    const drill = systemDesignDrills.find((d) => d.id === block.targetId);
    const prompt = systemDesignPrompts.find((p) => p.id === block.targetId);
    const rubric = drill ? prompt?.rubric ?? systemDesignPrompts[0]?.rubric : prompt?.rubric;
    const score = rubric ? computeScore(rubric, rubricChecks).overall : 0;
    if (drill) {
      const current = getSystemDesignDrillProgress(progress, drill.id);
      const next = {
        ...current,
        attempts: current.attempts + 1,
        lastAttemptedAt: new Date().toISOString(),
        lastScore: score,
        confidence
      };
      updateSystemDesignDrillProgress(drill.id, updateScheduleGeneric(next, 3, confidence));
    }
    if (prompt) {
      const current = getSystemDesignProgress(progress, prompt.id);
      const next = {
        ...current,
        attempts: current.attempts + 1,
        passes: current.passes + (score >= 0.6 ? 1 : 0),
        lastAttemptedAt: new Date().toISOString()
      };
      if (score >= 0.6) {
        updateSystemDesignProgress(prompt.id, updateScheduleGeneric(next, 3, confidence));
      } else {
        updateSystemDesignProgress(prompt.id, next);
      }
    }
    handleOutcome({ score });
  };

  useEffect(() => {
    if (!locked || !block.timed || autoCompleted) return;
    setAutoCompleted(true);
    if (block.blockType === 'dsa_drill' || block.blockType === 'dsa_timed_problem') {
      runTests().then((result) => finalizeDSA(result));
      return;
    }
    if (block.blockType === 'sd_drill' || block.blockType === 'sd_timed_prompt') {
      finalizeSD();
      return;
    }
    handleOutcome({});
  }, [locked, block, autoCompleted]);

  const designSteps = useMemo(() => {
    const prompt = systemDesignPrompts.find((p) => p.id === block.targetId);
    const drill = systemDesignDrills.find((d) => d.id === block.targetId);
    return parseDesignSteps(drill?.starterTemplateMarkdown ?? prompt?.guidedDesignStubMarkdown ?? '');
  }, [block]);

  const designCompletion = useMemo(() => {
    const prompt = systemDesignPrompts.find((p) => p.id === block.targetId);
    const drill = systemDesignDrills.find((d) => d.id === block.targetId);
    const base = drill?.starterTemplateMarkdown ?? prompt?.guidedDesignStubMarkdown ?? '';
    return computeDesignStepStatus(designText, base);
  }, [designText, block]);

  const regions = useMemo(() => {
    const drill = dsaDrills.find((d) => d.id === block.targetId);
    if (!drill) return [];
    return parseEditRegions(code, drill.allowedEditRegions);
  }, [code, block]);

  const onCodeChange = (next: string) => {
    if (!started) setStarted(true);
    if (locked) return;
    const drill = dsaDrills.find((d) => d.id === block.targetId);
    if (drill && !isEditAllowed(prevCodeRef.current, next, regions)) return;
    setCode(next);
    prevCodeRef.current = next;
  };

  const onDesignChange = (next: string) => {
    if (!started) setStarted(true);
    if (locked) return;
    setDesignText(next);
  };

  const blockContent = () => {
    if (block.blockType === 'dsa_review') {
      const problem = problems.find((p) => p.id === block.targetId);
      return (
        <div className="space-y-4">
          <ReactMarkdown className="text-sm text-mist-200 space-y-3">{problem?.statementMarkdown ?? ''}</ReactMarkdown>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-mist-200">Recall prompts</p>
            <ul className="mt-2 space-y-2 text-sm text-mist-300">
              {problem?.metadata.recallQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={() => handleOutcome({})}>
            Mark review complete
          </button>
        </div>
      );
    }

    if (block.blockType === 'dsa_drill' || block.blockType === 'dsa_timed_problem') {
      return (
        <div className="space-y-4">
          <CodeEditor value={code} language="typescript" onChange={onCodeChange} readOnly={locked} />
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={runTests}>
              Run tests
            </button>
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={finalizeDSA}>
              Finish block
            </button>
          </div>
          {runResult && <TestResults result={runResult} />}
        </div>
      );
    }

    if (block.blockType === 'sd_review') {
      const prompt = systemDesignPrompts.find((p) => p.id === block.targetId);
      return (
        <div className="space-y-4">
          <ReactMarkdown className="text-sm text-mist-200 space-y-3">{prompt?.promptMarkdown ?? ''}</ReactMarkdown>
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={() => handleOutcome({})}>
            Mark review complete
          </button>
        </div>
      );
    }

    if (block.blockType === 'sd_drill' || block.blockType === 'sd_timed_prompt') {
      const drill = systemDesignDrills.find((d) => d.id === block.targetId);
      const prompt = systemDesignPrompts.find((p) => p.id === block.targetId) ?? (drill ? systemDesignPrompts.find((p) => p.id === drill.relatedPromptId) : undefined);
      const rubric = prompt?.rubric;
      return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <textarea className="h-96 w-full rounded-2xl border border-white/10 bg-transparent p-4 text-sm text-mist-200" value={designText} onChange={(e) => onDesignChange(e.target.value)} readOnly={locked} />
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={finalizeSD}>
              Finish block
            </button>
          </div>
          <div className="space-y-4">
            <StepList steps={designSteps} completion={designCompletion} activeStep={0} />
            {rubric && (
              <SystemDesignRubric
                rubric={rubric}
                checked={rubricChecks}
                suggestions={{}}
                scores={computeScore(rubric, rubricChecks)}
                onToggle={(itemId, checked) => {
                  if (locked) return;
                  setRubricChecks((prev) => ({ ...prev, [itemId]: checked }));
                }}
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Reflection</p>
        <label className="block text-sm">What went well?
          <textarea className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-transparent p-2" value={patternText} onChange={(e) => setPatternText(e.target.value)} />
        </label>
        <label className="block text-sm">What would you change?
          <textarea className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-transparent p-2" value={explainText} onChange={(e) => setExplainText(e.target.value)} />
        </label>
        <label className="block text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)
          <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={() => handleOutcome({})}>
          Finish session
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Adaptive Session</p>
          <h1 className="font-display text-2xl font-semibold">{block.title}</h1>
          <p className="text-sm text-mist-300">Block {blockIndex + 1} of {plan.blocks.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Time remaining</p>
          <p className="text-xl font-semibold">{block.timed ? formatTime(remaining) : 'Untimed'}</p>
        </div>
      </div>

      {block.timed && !started && (
        <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={onStart}>
          Start block
        </button>
      )}
      {!block.timed && !started && (
        <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={onStart}>
          Begin
        </button>
      )}

      {locked && block.timed && (
        <p className="text-sm text-rose-300">Time is up. This block is now read-only.</p>
      )}

      {blockContent()}

      <div className="text-sm text-mist-300">
        <Link className="text-ember-400" to="/adaptive">Back to planner</Link>
      </div>
    </div>
  );
};

export default AdaptiveSession;
