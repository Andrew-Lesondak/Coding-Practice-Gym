import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import ReactTestResults from '../components/ReactTestResults';
import { useReactCodingProblems } from '../lib/useReactCodingProblems';
import { computeStepCompletion, getFirstIncompleteStep, parseSteps, parseTodoRegions } from '../lib/guidedStub';
import { runReactTests, ReactRunResult } from '../lib/reactRunner';
import { useAppStore, getReactCodingProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { getDraft, setDraft } from '../storage/stores/editorDraftStore';
import { StepStatus } from '../types/progress';

const tabs = [
  { id: 'prompt', label: 'Prompt' },
  { id: 'plan', label: 'Plan' },
  { id: 'solve', label: 'Solve' },
  { id: 'review', label: 'Review' }
];

const ReactCodingDetail = () => {
  const { id } = useParams();
  const problems = useReactCodingProblems();
  const problem = problems.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState('prompt');
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<ReactRunResult | undefined>();
  const [completion, setCompletion] = useState<Record<number, StepStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [conceptText, setConceptText] = useState('');
  const [edgeText, setEdgeText] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [confidenceRating, setConfidenceRating] = useState(3);
  const prevCodeRef = useRef('');

  const progress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);
  const updateProgress = useAppStore((state) => state.updateReactCodingProgress);
  const setStepCompletion = useAppStore((state) => state.setReactCodingStepStatus);
  const saveExplanation = useAppStore((state) => state.saveReactCodingExplanation);

  const steps = useMemo(() => (problem ? parseSteps(problem.guidedStubTsx) : []), [problem]);
  const stepHints = useMemo(() => {
    const hints: Record<number, { level1: string; level2: string; level3: string }> = {};
    steps.forEach((step) => {
      hints[step.index] = {
        level1: step.title,
        level2: step.title,
        level3: step.title
      };
    });
    return hints;
  }, [steps]);
  const regionSteps = useMemo(() => {
    if (!problem) return new Set<number>();
    return new Set(parseTodoRegions(problem.guidedStubTsx).map((region) => region.stepIndex));
  }, [problem]);
  const problemProgress = problem ? getReactCodingProgress(progress, problem.id) : undefined;

  useEffect(() => {
    if (!problem) return;
    let active = true;
    const storageKey = `react-gym-code-${problem.id}`;
    getDraft(storageKey).then((savedDraft) => {
      if (!active) return;
      const saved = savedDraft?.value ?? null;
      const nextCode = saved ?? problem.guidedStubTsx;
      setCode(nextCode);
      prevCodeRef.current = nextCode;
      if (!saved) {
        void setDraft(storageKey, nextCode);
      }
    });
    if (problemProgress?.explanation) {
      setConceptText(problemProgress.explanation.concept);
      setEdgeText(problemProgress.explanation.edgeCase);
      setReviewText(problemProgress.explanation.reviewWatch);
    } else {
      setConceptText('');
      setEdgeText('');
      setReviewText('');
    }
    return () => {
      active = false;
    };
  }, [problem, problemProgress?.explanation]);

  useEffect(() => {
    if (!problem) return;
    const nextCompletion = computeStepCompletion(code, problem.guidedStubTsx);
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
        <Link className="text-sm text-ember-400" to="/react/catalog">
          Back to catalog
        </Link>
      </div>
    );
  }

  const activeStep = getFirstIncompleteStep(completion, steps, regionSteps);

  const runTests = async (submit: boolean) => {
    setIsRunning(true);
    setRunResult(undefined);
    updateProgress(problem.id, {
      attempts: problemProgress.attempts + 1,
      lastAttemptedAt: new Date().toISOString()
    });
    const testCode = submit
      ? `${problem.tests.visible}\n${problem.tests.hidden}`
      : problem.tests.visible;
    const result = await runReactTests({
      userCode: code,
      testCode,
      timeoutMs: 1500
    });
    setRunResult(result);
    setIsRunning(false);
    if (submit && result.ok) {
      updateProgress(problem.id, {
        passes: problemProgress.passes + 1,
        lastPassedAt: new Date().toISOString()
      });
      setShowExplainModal(true);
    }
  };

  const submitRating = () => {
    const updated = updateScheduleGeneric(problemProgress, difficultyRating, confidenceRating);
    updateProgress(problem.id, updated);
  };

  const submitExplanation = () => {
    saveExplanation(problem.id, {
      concept: conceptText.trim(),
      edgeCase: edgeText.trim(),
      reviewWatch: reviewText.trim()
    });
    setShowExplainModal(false);
  };

  const onCodeChange = (next: string) => {
    setCode(next);
    prevCodeRef.current = next;
    void setDraft(`react-gym-code-${problem.id}`, next);
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
          onClick={() => {
            const next = problem.guidedStubTsx;
            setCode(next);
            prevCodeRef.current = next;
            void setDraft(`react-gym-code-${problem.id}`, next);
          }}
        >
          Reset
        </button>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'prompt' && (
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-2xl p-6">
            <ReactMarkdown className="text-sm text-mist-200 space-y-4">{problem.promptMarkdown}</ReactMarkdown>
            <div className="mt-6 space-y-3">
              <h3 className="font-display text-lg">Requirements</h3>
              <ul className="space-y-2 text-sm text-mist-200">
                {problem.requirements.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
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
              <h3 className="font-display text-lg">Topics</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.topics.map((topic) => (
                  <span key={topic} className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist-200">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'plan' && (
        <section className="glass rounded-2xl p-6">
          <p className="text-sm text-mist-200">Use the guided steps in the Solve tab.</p>
        </section>
      )}

      {activeTab === 'solve' && (
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
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
            <CodeEditor value={code} language="typescript" onChange={onCodeChange} />
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Run output</p>
              <div className="mt-3">
                <ReactTestResults result={runResult} />
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
                  showDescription={false}
                  hintLevel={settings.hintLevel}
                  hints={stepHints}
                />
                <p className="mt-3 text-xs text-mist-400">
                  Hint level {settings.hintLevel}. Adjust defaults in settings to reveal more scaffolding.
                </p>
              </div>
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
            <h3 className="font-display text-lg">Reflection</h3>
            <p className="mt-3 text-sm text-mist-200">Save a review schedule after passing.</p>
            <div className="mt-4 space-y-4">
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
          </div>
        </section>
      )}

      {showExplainModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6">
          <div className="glass w-full max-w-xl rounded-2xl p-6">
            <h3 className="font-display text-xl font-semibold">Explain it back</h3>
            <p className="mt-2 text-sm text-mist-200">
              Capture what made this React problem tricky so it sticks.
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">
                What React concept was the key?
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={conceptText}
                  onChange={(event) => setConceptText(event.target.value)}
                />
              </label>
              <label className="block">
                Tricky edge case
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={edgeText}
                  onChange={(event) => setEdgeText(event.target.value)}
                />
              </label>
              <label className="block">
                Code review watch-out
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
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
                disabled={!conceptText.trim() || !edgeText.trim() || !reviewText.trim()}
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

export default ReactCodingDetail;
