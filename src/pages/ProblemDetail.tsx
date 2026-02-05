import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import TestResults from '../components/TestResults';
import { problems } from '../data/problems';
import { computeStepCompletion, findLockedRegion, getFirstIncompleteStep, parseSteps } from '../lib/guidedStub';
import { runInWorker, RunResponse } from '../lib/runnerClient';
import { updateSchedule } from '../lib/spacedRepetition';
import { useAppStore, getProblemProgress } from '../store/useAppStore';
import { toJavaScriptStub } from '../lib/codeTransform';

const tabs = [
  { id: 'statement', label: 'Statement' },
  { id: 'plan', label: 'Plan' },
  { id: 'solve', label: 'Solve' },
  { id: 'review', label: 'Review' }
];

const applyHintLevel = (code: string, level: number) => {
  const lines = code.split('\n');
  return lines
    .filter((line) => {
      const match = line.match(/\/\/\s*HINT\(level\s+(\d+)\):/);
      if (!match) return true;
      const hintLevel = Number(match[1]);
      return hintLevel <= level;
    })
    .join('\n');
};

const getStubForMode = (stub: string, languageMode: 'ts' | 'js', hintLevel: number) => {
  const withHints = applyHintLevel(stub, hintLevel);
  return languageMode === 'js' ? toJavaScriptStub(withHints) : withHints;
};

const ProblemDetail = () => {
  const { id } = useParams();
  const problem = problems.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState('statement');
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<RunResponse | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [confidenceRating, setConfidenceRating] = useState(3);
  const prevCodeRef = useRef('');

  const progress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);
  const updateProgress = useAppStore((state) => state.updateProblemProgress);
  const setStepCompletion = useAppStore((state) => state.setStepCompletion);
  const resetProblem = useAppStore((state) => state.resetProblem);

  const steps = useMemo(() => (problem ? parseSteps(problem.guidedStub) : []), [problem]);
  const problemProgress = problem ? getProblemProgress(progress, problem.id) : undefined;

  useEffect(() => {
    if (!problem) return;
    const storageKey = `dsa-gym-code-${problem.id}-${settings.languageMode}`;
    const saved = localStorage.getItem(storageKey);
    const stubWithHints = getStubForMode(problem.guidedStub, settings.languageMode, settings.hintLevel);
    setCode(saved ?? stubWithHints);
    prevCodeRef.current = saved ?? stubWithHints;
  }, [problem, settings.hintLevel, settings.languageMode]);

  useEffect(() => {
    if (!problem) return;
    const completion = computeStepCompletion(code, problem.guidedStub);
    Object.entries(completion).forEach(([stepIndex, completed]) => {
      setStepCompletion(problem.id, Number(stepIndex), completed);
    });
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

  const completion = problemProgress.stepCompletion;
  const activeStep = getFirstIncompleteStep(completion, steps);

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
      setActiveTab('review');
    }
  };

  const handleReset = () => {
    resetProblem(problem.id);
    const resetCode = getStubForMode(problem.guidedStub, settings.languageMode, settings.hintLevel);
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

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

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
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
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
                  Run tests
                </button>
                <button
                  className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                  onClick={() => runTests(true)}
                  disabled={isRunning}
                >
                  Submit
                </button>
              </div>
            </div>
            <CodeEditor value={code} language={settings.languageMode === 'ts' ? 'typescript' : 'javascript'} onChange={onCodeChange} />
            <div className="rounded-2xl border border-white/10 p-4">
              <TestResults result={runResult} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <p className="text-xs text-mist-300">Active step: {activeStep}</p>
              <div className="mt-4">
                <StepList steps={steps} completion={completion} activeStep={activeStep} />
              </div>
              {settings.lockSteps && (
                <p className="mt-4 text-xs text-mist-300">Later steps are locked until the active step is complete.</p>
              )}
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
          </div>
        </section>
      )}
    </div>
  );
};

export default ProblemDetail;
