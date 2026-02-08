import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import TestResults from '../components/TestResults';
import { useProblems } from '../lib/useProblems';
import { Problem } from '../types/problem';
import {
  computeStepCompletion,
  findLockedRegion,
  getFirstIncompleteStep,
  parseSteps,
  parseTodoRegions
} from '../lib/guidedStub';
import { runInWorker, RunResponse } from '../lib/runnerClient';
import { updateSchedule } from '../lib/spacedRepetition';
import { useAppStore, getProblemProgress } from '../store/useAppStore';
import { toJavaScriptStub } from '../lib/codeTransform';
import { stableStringify } from '../lib/runnerUtils';
import { evaluateStepChecks } from '../lib/stepChecks';
import { StepStatus } from '../types/progress';

const tabs = [
  { id: 'statement', label: 'Statement' },
  { id: 'plan', label: 'Plan' },
  { id: 'solve', label: 'Solve' },
  { id: 'review', label: 'Review' }
];

const applyHintLevel = (code: string, level: number) => {
  const lines = code.split('\n');
  const filteredHints = lines.filter((line) => {
    const match = line.match(/\/\/\s*HINT\(level\s+(\d+)\):/);
    if (!match) return true;
    const hintLevel = Number(match[1]);
    if (level >= 2) {
      return hintLevel === level;
    }
    return hintLevel <= level;
  });

  return filteredHints
    .map((line) => {
      if (level === 0) {
        if (/\/\/\s*HINT\(level\s+\d+\):/.test(line)) {
          return null;
        }
        const match = line.match(/^(\s*\/\/\s*Step\s+\d+(?:\.\d+)?)(\s*:\s*.+)?$/);
        if (match) {
          return match[1];
        }
      }
      return line;
    })
    .filter((line): line is string => line !== null)
    .join('\n');
};

const applyHintLevelToStub = (code: string, level: number) => {
  const lines = code.split('\n');
  let insideTodo = false;
  const filtered = lines.filter((line) => {
    if (/\/\/\s*TODO\(step\s+.*\s+start\)/.test(line)) {
      insideTodo = true;
      return true;
    }
    if (/\/\/\s*TODO\(step\s+.*\s+end\)/.test(line)) {
      insideTodo = false;
      return true;
    }
    const hintMatch = line.match(/\/\/\s*HINT\(level\s+(\d+)\):/);
    if (hintMatch) {
      const hintLevel = Number(hintMatch[1]);
      if (level >= 2) {
        return hintLevel === level;
      }
      return hintLevel <= level;
    }
    if (insideTodo && level >= 2) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') && !/\/\/\s*Step\s+\d+/.test(trimmed)) {
        return false;
      }
    }
    return true;
  });

  return applyHintLevel(filtered.join('\n'), level);
};

const formatRegexExample = (pattern: string) => {
  return pattern
    .replace(/\\s\*/g, ' ')
    .replace(/\\s\+/g, ' ')
    .replace(/\\s\?/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\./g, '.')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\.\*/g, ' ... ')
    .replace(/\|/g, ' or ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildStepHints = (steps: ReturnType<typeof parseSteps>, stepChecks: Problem['stepChecks'] | undefined) => {
  if (!stepChecks || stepChecks.length === 0) return {};
  const hints: Record<number, { level1: string; level2: string; level3: string }> = {};
  const grouped: Record<number, typeof stepChecks> = {};
  stepChecks.forEach((check) => {
    grouped[check.stepIndex] = grouped[check.stepIndex] ?? [];
    grouped[check.stepIndex].push(check);
  });
  Object.entries(grouped).forEach(([key, checks]) => {
    const stepIndex = Number(key);
    const [primary, secondary] = checks;
    const stepTitle = steps.find((step) => step.index === stepIndex)?.title ?? `Step ${stepIndex}`;
    const level1 = stepTitle;
    const level2 = primary?.message ?? 'Focus on the next invariant update.';
    const level3Parts: string[] = [];
    if (primary?.message) level3Parts.push(primary.message);
    if (secondary?.message) level3Parts.push(secondary.message);
    if (primary?.kind === 'regex' && primary.pattern) {
      level3Parts.push(`Example: ${formatRegexExample(primary.pattern)}`);
    }
    const level3 = level3Parts.length > 0 ? level3Parts.join(' · ') : level2;
    hints[stepIndex] = { level1, level2, level3 };
  });
  return hints;
};

const injectStepHints = (
  stub: string,
  stepHints: Record<number, { level1: string; level2: string; level3: string }>
) => {
  if (!stepHints || Object.keys(stepHints).length === 0) return stub;
  if (stub.includes('HINT(level 1):')) return stub;
  let next = stub;
  Object.entries(stepHints).forEach(([key, hint]) => {
    const stepIndex = key.replace('.', '\\.');
    const regex = new RegExp(`^(\\s*//\\s*TODO\\(step\\s+${stepIndex}\\s+start\\)\\s*)$`, 'm');
    next = next.replace(regex, (_match, line) => {
      const indent = line.match(/^(\s*)/)?.[1] ?? '';
      return (
        `${line}\n` +
        `${indent}// HINT(level 1): ${hint.level1}\n` +
        `${indent}// HINT(level 2): ${hint.level2}\n` +
        `${indent}// HINT(level 3): ${hint.level3}`
      );
    });
  });
  return next;
};

const stripHintLines = (code: string) => {
  return code
    .split('\n')
    .filter((line) => !/\/\/\s*HINT\(level\s+\d+\):/.test(line))
    .join('\n');
};

const updateHintsInCode = (
  code: string,
  stepHints: Record<number, { level1: string; level2: string; level3: string }>
) => {
  const withoutHints = stripHintLines(code);
  return injectStepHints(withoutHints, stepHints);
};

const ensureStepSpacing = (code: string) => {
  const lines = code.split('\n');
  const result: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const isStepHeader = /^\s*\/\/\s*Step\s+\d+(?:\.\d+)?\b/.test(line);
    if (isStepHeader && result.length > 0 && result[result.length - 1].trim() !== '') {
      result.push('');
    }
    result.push(line);
  }
  return result.join('\n');
};

const getStubForMode = (
  stub: string,
  languageMode: 'ts' | 'js',
  hintLevel: number,
  stepHints: Record<number, { level1: string; level2: string; level3: string }>
) => {
  const withInjectedHints = injectStepHints(stub, stepHints);
  const withHints = applyHintLevelToStub(withInjectedHints, hintLevel);
  const withSpacing = ensureStepSpacing(withHints);
  return languageMode === 'js' ? toJavaScriptStub(withSpacing) : withSpacing;
};

const ProblemDetail = () => {
  const { id } = useParams();
  const problems = useProblems();
  const problem = problems.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState('statement');
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<RunResponse | undefined>();
  const [completion, setCompletion] = useState<Record<number, StepStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [patternText, setPatternText] = useState('');
  const [whyText, setWhyText] = useState('');
  const [complexityText, setComplexityText] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [confidenceRating, setConfidenceRating] = useState(3);
  const prevCodeRef = useRef('');
  const lastStubRef = useRef('');
  const [lastRunMode, setLastRunMode] = useState<'run' | 'submit' | null>(null);
  const [lastSubmitPassed, setLastSubmitPassed] = useState(false);
  const [lastSubmitProblemId, setLastSubmitProblemId] = useState<string | null>(null);

  const progress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);
  const updateProgress = useAppStore((state) => state.updateProblemProgress);
  const setStepCompletion = useAppStore((state) => state.setStepCompletion);
  const resetProblem = useAppStore((state) => state.resetProblem);
  const saveExplanation = useAppStore((state) => state.saveExplanation);

  const steps = useMemo(() => (problem ? parseSteps(problem.guidedStub) : []), [problem]);
  const stepHints = useMemo(
    () => (problem ? buildStepHints(steps, problem.stepChecks) : {}),
    [problem, steps]
  );
  const regionSteps = useMemo(() => {
    if (!problem) {
      return new Set<number>();
    }
    return new Set(parseTodoRegions(problem.guidedStub).map((region) => region.stepIndex));
  }, [problem]);
  const problemProgress = problem ? getProblemProgress(progress, problem.id) : undefined;
  const isPreviouslyPassed = Boolean(problemProgress && problemProgress.passes > 0);
  const showExplainButton = isPreviouslyPassed || (lastSubmitPassed && lastSubmitProblemId === problem?.id);

  useEffect(() => {
    if (!problem) return;
    const savedTab = sessionStorage.getItem(`dsa-gym-problem-tab-${problem.id}`);
    if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
    const storageKey = `dsa-gym-code-${problem.id}-${settings.languageMode}`;
    const saved = localStorage.getItem(storageKey);
    const stubWithHints = getStubForMode(
      problem.guidedStub,
      settings.languageMode,
      settings.hintLevel,
      stepHints
    );
    const isEdited = saved !== null && lastStubRef.current && saved !== lastStubRef.current;
    const shouldReplaceSaved =
      saved !== null &&
      lastStubRef.current &&
      saved === lastStubRef.current &&
      saved !== stubWithHints;

    const baseCode = shouldReplaceSaved ? stubWithHints : saved ?? stubWithHints;
    const editedWithHints = isEdited && saved ? updateHintsInCode(saved, stepHints) : baseCode;
    const nextCode = isEdited && saved
      ? applyHintLevelToStub(editedWithHints, settings.hintLevel)
      : baseCode;

    setCode(nextCode);
    prevCodeRef.current = nextCode;
    if (shouldReplaceSaved || saved === null) {
      localStorage.setItem(storageKey, nextCode);
    }
    lastStubRef.current = stubWithHints;
    if (problemProgress?.explanation) {
      setPatternText(problemProgress.explanation.pattern);
      setWhyText(problemProgress.explanation.why);
      setComplexityText(problemProgress.explanation.complexity);
    } else {
      setPatternText('');
      setWhyText('');
      setComplexityText('');
    }
  }, [problem, settings.hintLevel, settings.languageMode, problemProgress?.explanation, stepHints]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (problem) {
      sessionStorage.setItem(`dsa-gym-problem-tab-${problem.id}`, tabId);
    }
  };

  useEffect(() => {
    if (!problem) return;
    const nextCompletion = computeStepCompletion(code, problem.guidedStub);
    setCompletion(nextCompletion);
    const timer = window.setTimeout(() => {
      Object.entries(nextCompletion).forEach(([stepIndex, status]) => {
        setStepCompletion(problem.id, Number(stepIndex), status);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [code, problem, setStepCompletion]);

  if (!problem || !problemProgress) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Problem not found.</p>
        <Link className="text-sm text-ember-400" to="/catalog">
          Back to catalog
        </Link>
      </div>
    );
  }

  const activeStep = getFirstIncompleteStep(completion, steps, regionSteps);
  const stepCheckResult = useMemo(
    () => evaluateStepChecks(code, problem.stepChecks ?? [], activeStep),
    [code, problem.stepChecks, activeStep]
  );

  const onCodeChange = (next: string) => {
    if (settings.lockSteps && findLockedRegion(prevCodeRef.current, next, activeStep)) {
      return;
    }
    setCode(next);
    prevCodeRef.current = next;
    localStorage.setItem(`dsa-gym-code-${problem.id}-${settings.languageMode}`, next);
  };

  const runTests = async (submit: boolean) => {
    setIsRunning(true);
    setRunResult(undefined);
    setLastRunMode(submit ? 'submit' : 'run');
    if (submit) {
      setLastSubmitPassed(false);
      setLastSubmitProblemId(problem.id);
    }
    const tests = submit ? [...problem.tests.visible, ...problem.tests.hidden] : problem.tests.visible;

    updateProgress(problem.id, {
      attempts: problemProgress.attempts + 1,
      lastAttemptedAt: new Date().toISOString()
    });

    const result = await runInWorker({
      code,
      functionName: problem.functionName,
      tests,
      language: settings.languageMode,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat
    });

    setRunResult(result);
    setIsRunning(false);

    if (submit && result.ok) {
      updateProgress(problem.id, {
        passes: problemProgress.passes + 1,
        lastPassedAt: new Date().toISOString()
      });
      setShowRating(true);
      setLastSubmitPassed(true);
      setLastSubmitProblemId(problem.id);
    }
  };

  const copyFailureReport = async () => {
    if (!runResult) return;
    const lines: string[] = [];
    lines.push(`${problem.title} - ${runResult.ok ? 'All tests passed' : 'Test failures'}`);
    if (runResult.errorType) lines.push(`ErrorType: ${runResult.errorType}`);
    if (runResult.error) lines.push(`Error: ${runResult.error}`);
    runResult.results.forEach((result) => {
      if (!result.passed) {
        lines.push(`Test: ${result.name}`);
        lines.push(`Input: ${stableStringify(result.input)}`);
        lines.push(`Expected: ${stableStringify(result.expected)}`);
        lines.push(`Actual: ${stableStringify(result.actual)}`);
        if (result.error) lines.push(`Error: ${result.error}`);
      }
    });
    if (runResult.logs.length > 0) {
      lines.push('Console:');
      lines.push(...runResult.logs);
    }
    await navigator.clipboard.writeText(lines.join('\\n'));
  };

  const handleReset = () => {
    resetProblem(problem.id);
    const resetCode = getStubForMode(
      problem.guidedStub,
      settings.languageMode,
      settings.hintLevel,
      stepHints
    );
    setCode(resetCode);
    prevCodeRef.current = resetCode;
    localStorage.setItem(`dsa-gym-code-${problem.id}-${settings.languageMode}`, resetCode);
    setRunResult(undefined);
  };

  const submitRating = () => {
    const updated = updateSchedule(problemProgress, difficultyRating, confidenceRating);
    updateProgress(problem.id, updated);
    setShowRating(false);
  };

  const submitExplanation = () => {
    saveExplanation(problem.id, {
      pattern: patternText.trim(),
      why: whyText.trim(),
      complexity: complexityText.trim()
    });
    setShowExplainModal(false);
  };

  const isDueForReview =
    Boolean(problemProgress.nextReviewAt) && new Date(problemProgress.nextReviewAt as string) <= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{problem.difficulty}</p>
          <h1 className="font-display text-2xl font-semibold">{problem.title}</h1>
        </div>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200"
          onClick={handleReset}
        >
          Reset this problem
        </button>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={handleTabChange} />

      {activeTab === 'statement' && (
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-2xl p-6">
            <ReactMarkdown className="text-sm text-mist-200 space-y-4">{problem.statementMarkdown}</ReactMarkdown>
            <div className="mt-6 space-y-3">
              <h3 className="font-display text-lg">Examples</h3>
              {problem.examples.map((example, index) => (
                <div key={`${problem.id}-ex-${index}`} className="rounded-xl border border-white/10 p-4 text-sm">
                  <p className="text-mist-200">Input: {example.input}</p>
                  <p className="text-mist-200">Output: {example.output}</p>
                  {example.explanation && <p className="text-mist-300">{example.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Constraints</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.constraints.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="font-display text-lg">Patterns</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.patterns.map((pattern) => (
                  <span key={pattern} className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist-200">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'plan' && (
        <section className="glass rounded-2xl p-6">
          <ReactMarkdown className="text-sm text-mist-200 space-y-4">{problem.planMarkdown}</ReactMarkdown>
        </section>
      )}

      {activeTab === 'solve' && (
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {isDueForReview && problemProgress.explanation && (
              <div className="rounded-2xl border border-ember-500/30 bg-ember-500/10 p-4 text-sm text-mist-200">
                <p className="font-semibold text-ember-300">Due for review: your last explanation</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mist-300">Pattern</p>
                <p>{problemProgress.explanation.pattern}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist-300">Why it works</p>
                <p>{problemProgress.explanation.why}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist-300">Complexity</p>
                <p>{problemProgress.explanation.complexity}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Guided stub</p>
                <p className="text-sm text-mist-200">Complete each TODO block in order.</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                  onClick={() => runTests(false)}
                  disabled={isRunning}
                >
                  Run Tests
                </button>
                <button
                  className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                  onClick={() => runTests(true)}
                  disabled={isRunning}
                >
                  Submit
                </button>
                {showExplainButton && (
                  <button
                    className="rounded-full border border-emerald-400/40 px-4 py-2 text-xs text-emerald-200"
                    onClick={() => setShowExplainModal(true)}
                  >
                    Explain it back
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-mist-400">
              Submit runs hidden tests too, so passing “Run Tests” does not guarantee a Submit pass.
            </p>
            <CodeEditor value={code} language={settings.languageMode === 'ts' ? 'typescript' : 'javascript'} onChange={onCodeChange} />
            <div className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Run output</p>
                <button
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200"
                  onClick={copyFailureReport}
                  disabled={!runResult}
                >
                  Copy failure report
                </button>
              </div>
              {runResult && (
                <div
                  className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                    runResult.ok ? 'border-emerald-400/40 text-emerald-200' : 'border-amber-400/40 text-amber-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="uppercase tracking-[0.2em]">
                      {lastRunMode === 'submit' ? 'Submit' : 'Run'}
                    </span>
                    <span className="text-mist-300">·</span>
                    <span>
                      {runResult.ok ? 'Passed' : 'Failed'} {runResult.results.length}/{runResult.results.length} tests
                    </span>
                    {lastRunMode === 'submit' && (
                      <span className="text-mist-300">includes hidden tests</span>
                    )}
                  </div>
                  {runResult.error && (
                    <p className="mt-1 text-xs text-mist-300">
                      {runResult.errorType ?? 'Error'}: {runResult.error}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-3">
                <TestResults result={runResult} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <p className="text-xs text-mist-300">Active step: {activeStep}</p>
              <div className="mt-4">
                <StepList
                  steps={steps}
                  completion={completion}
                  activeStep={activeStep}
                  showDescription={settings.hintLevel > 0}
                  hintLevel={settings.hintLevel}
                  hints={stepHints}
                />
              </div>
              {settings.lockSteps && (
                <p className="mt-4 text-xs text-mist-300">Later steps are locked until the active step is complete.</p>
              )}
              <div className="mt-4 rounded-xl border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Step checks</p>
                {stepCheckResult.checks.length === 0 ? (
                  <p className="mt-2 text-xs text-mist-400">No checks for this step.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs text-mist-200">
                    {stepCheckResult.checks.map((check, index) => (
                      <li key={`${check.message}-${index}`} className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            check.passed ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span>{check.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Hints</h3>
              <p className="text-sm text-mist-200">
                Hint level {settings.hintLevel}. Adjust defaults in settings to reveal more scaffolding.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'review' && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Recall prompts</h3>
            <ul className="mt-4 space-y-2 text-sm text-mist-200">
              {problem.metadata.recallQuestions.map((question) => (
                <li key={question}>• {question}</li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-lg">Common pitfalls</h3>
            <ul className="mt-4 space-y-2 text-sm text-mist-200">
              {problem.metadata.commonPitfalls.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Complexity</h3>
            <p className="mt-3 text-sm text-mist-200">Time: {problem.metadata.timeComplexity}</p>
            <p className="text-sm text-mist-200">Space: {problem.metadata.spaceComplexity}</p>

            {showRating && (
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold text-ember-300">Quick reflection</p>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Difficulty (1-5)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={difficultyRating}
                    onChange={(event) => setDifficultyRating(Number(event.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={confidenceRating}
                    onChange={(event) => setConfidenceRating(Number(event.target.value))}
                    className="mt-2 w-full"
                  />
                </div>
                <button
                  className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                  onClick={submitRating}
                >
                  Save review schedule
                </button>
              </div>
            )}

            {problemProgress.explanation && (problemProgress.explanationHistory?.length ?? 0) > 0 && (
              <div className="mt-6 space-y-3">
                <button
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                  onClick={() => setShowCompare((prev) => !prev)}
                >
                  {showCompare ? 'Hide' : 'Compare my last explanation'}
                </button>
                {showCompare && (
                  <div className="space-y-4 text-sm text-mist-200">
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Previous</p>
                      <p className="mt-2">{problemProgress.explanationHistory?.slice(-1)[0]?.pattern}</p>
                      <p className="mt-2">{problemProgress.explanationHistory?.slice(-1)[0]?.why}</p>
                      <p className="mt-2">{problemProgress.explanationHistory?.slice(-1)[0]?.complexity}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Current</p>
                      <p className="mt-2">{problemProgress.explanation?.pattern}</p>
                      <p className="mt-2">{problemProgress.explanation?.why}</p>
                      <p className="mt-2">{problemProgress.explanation?.complexity}</p>
                    </div>
                    <p className="text-xs text-mist-300">Update your explanation if it improved.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {showExplainModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="glass w-full max-w-xl rounded-2xl p-6">
            <h3 className="font-display text-xl font-semibold">Explain it back</h3>
            <p className="mt-2 text-sm text-mist-200">
              Capture the pattern and why the solution works to lock in retention.
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">
                Pattern used
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={patternText}
                  onChange={(event) => setPatternText(event.target.value)}
                  placeholder={`e.g. ${problem.patterns.join(', ')}`}
                />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {problem.patterns.map((pattern) => (
                    <button
                      key={pattern}
                      className="rounded-full border border-white/15 px-3 py-1 text-mist-200"
                      onClick={() => setPatternText(pattern)}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </label>
              <label className="block">
                Why it works (2-4 sentences)
                <textarea
                  className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={whyText}
                  onChange={(event) => setWhyText(event.target.value)}
                />
              </label>
              <label className="block">
                Complexity (time / space)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={complexityText}
                  onChange={(event) => setComplexityText(event.target.value)}
                  placeholder="O(n) time, O(1) space"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                onClick={() => setShowExplainModal(false)}
              >
                Close
              </button>
              <button
                className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                onClick={submitExplanation}
                disabled={!patternText.trim() || !whyText.trim() || !complexityText.trim()}
              >
                Save explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;
