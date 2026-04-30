import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import ReactTestResults from '../components/ReactTestResults';
import { useReactCodingProblems } from '../lib/useReactCodingProblems';
import { computeStepCompletion, getFirstIncompleteStep, parseSteps, parseTodoRegions } from '../lib/guidedStub';
import { getReactStepHints } from '../lib/reactStepHints';
import { runReactTests, ReactRunResult } from '../lib/reactRunner';
import { useAppStore, getReactCodingProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { getDraft, setDraft } from '../storage/stores/editorDraftStore';
import { StepStatus } from '../types/progress';

const REACT_CODING_TAB_KEY_PREFIX = 'coding-practice-gym-react-coding-tab';

const tabs = [
  { id: 'prompt', label: 'Prompt' },
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


const moveStepCommentBlockIntoComponent = (code: string) => {
  const lines = code.split('\n');
  const isStepComment = (line: string) =>
    /^\s*\/\/\s*(Step\s+\d+(?:\.\d+)?|TODO\(step\s+.*\)|HINT\(level\s+\d+\):)/.test(line);
  const isSkippableBetweenBlockAndComponent = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/^type\s+\w+\s*=/.test(trimmed)) return true;
    if (/^(export\s+)?interface\s+\w+/.test(trimmed)) return true;
    return false;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const decl = lines[i].match(/^\s*export\s+const\s+\w+\s*(?::[^=]+)?=\s*\([^)]*\)\s*=>\s*\{\s*$/);
    if (!decl) continue;

    let j = i - 1;
    while (j >= 0 && isSkippableBetweenBlockAndComponent(lines[j])) j -= 1;

    let end = j;
    while (end >= 0 && lines[end].trim() === '') end -= 1;
    let start = end;
    while (start >= 0 && isStepComment(lines[start])) start -= 1;
    start += 1;

    if (start > end) continue;

    const block = lines.slice(start, end + 1);
    if (!block.some((line) => /TODO\(step\s+/.test(line))) continue;

    const before = lines.slice(0, start);
    const between = lines.slice(end + 1, i + 1);
    const after = lines.slice(i + 1);

    const moved = [...before, ...between, ...block, ...after];
    return moved.join('\n');
  }

  return code;
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
  const lines = stripHintLines(code).split('\n');
  const output: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    output.push(line);
    const match = line.match(/^(\s*)\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+start\)/);
    if (!match) continue;
    const indent = match[1] ?? '';
    const stepIndex = Number(match[2]);
    const hints = stepHints[stepIndex];
    if (!hints) continue;
    let hasHint = false;
    for (let j = i + 1; j < lines.length; j += 1) {
      if (/\/\/\s*TODO\(step\s+.*\s+end\)/.test(lines[j])) break;
      if (/\/\/\s*HINT\(level\s+\d+\):/.test(lines[j])) {
        hasHint = true;
        break;
      }
    }
    if (!hasHint) {
      output.push(`${indent}// HINT(level 2): ${hints.level2}`);
      output.push(`${indent}// HINT(level 3): ${hints.level3}`);
    }
  }
  return output.join('\n');
};

const ReactCodingDetail = () => {
  const { id } = useParams();
  const problems = useReactCodingProblems();
  const problem = problems.find((item) => item.id === id);
  const [activeTab, setActiveTab] = useState(() => 'prompt');
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

  const rawSteps = useMemo(() => (problem ? parseSteps(problem.guidedStubTsx) : []), [problem]);
  const stepHints = useMemo(
    () => (problem ? getReactStepHints(problem.id, rawSteps) : {}),
    [problem, rawSteps]
  );
  const steps = useMemo(
    () =>
      rawSteps.map((step) => ({
        ...step,
        title: stepHints[step.index]?.level1 ?? step.title,
        description: stepHints[step.index]?.level1 ?? step.description
      })),
    [rawSteps, stepHints]
  );
  const regionSteps = useMemo(() => {
    if (!problem) return new Set<number>();
    return new Set(parseTodoRegions(problem.guidedStubTsx).map((region) => region.stepIndex));
  }, [problem]);
  const problemProgress = problem ? getReactCodingProgress(progress, problem.id) : undefined;

  useEffect(() => {
    if (!problem) return;
    const savedTab = sessionStorage.getItem(`${REACT_CODING_TAB_KEY_PREFIX}-${problem.id}`);
    if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
    let active = true;
    const storageKey = `react-gym-code-${problem.id}`;
    getDraft(storageKey).then((savedDraft) => {
      if (!active) return;
      const saved = savedDraft?.value ?? null;
      const savedBase = saved ? stripHintLines(saved) : null;
      const baseSource = savedBase ?? problem.guidedStubTsx;
      const withHints = updateHintsInCode(baseSource, stepHints);
      const nextCodeRaw = applyHintLevelToStub(withHints, settings.hintLevel);
      const nextCode = moveStepCommentBlockIntoComponent(nextCodeRaw);
      setCode(nextCode);
      prevCodeRef.current = nextCode;
      if (!saved) {
        void setDraft(storageKey, stripHintLines(nextCode));
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
  }, [problem, problemProgress?.explanation, settings.hintLevel, stepHints]);


  useEffect(() => {
    if (!problem) return;
    sessionStorage.setItem(`${REACT_CODING_TAB_KEY_PREFIX}-${problem.id}`, activeTab);
  }, [activeTab, problem]);

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
    const result = await runReactTests({
      userCode: code,
      testCode: submit ? [problem.tests.visible, problem.tests.hidden] : problem.tests.visible,
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
    void setDraft(`react-gym-code-${problem.id}`, stripHintLines(next));
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
            <CodeEditor value={code} language="typescript" onChange={onCodeChange} path={`inmemory://react-coding/${problem.id}.tsx`} />
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
                  showDescription={settings.hintLevel > 0}
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
