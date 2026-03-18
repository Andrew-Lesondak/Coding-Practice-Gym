import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import UnitTestingResults from '../components/UnitTestingResults';
import { useUnitTestingProblems } from '../lib/useUnitTestingProblems';
import { computeStepCompletion, getFirstIncompleteStep, parseSteps, parseTodoRegions } from '../lib/guidedStub';
import { getUnitTestingProgress, useAppStore } from '../store/useAppStore';
import { getDraft, setDraft } from '../storage/stores/editorDraftStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { runUnitTestingTests, submitUnitTestingSolution, UnitTestingRunResult } from '../lib/unitTestingRunner';
import { StepStatus } from '../types/progress';

const tabs = [
  { id: 'prompt', label: 'Prompt' },
  { id: 'plan', label: 'Plan' },
  { id: 'solve', label: 'Solve' },
  { id: 'review', label: 'Review' }
];

const UnitTestingDetail = () => {
  const { id } = useParams();
  const problems = useUnitTestingProblems();
  const problem = problems.find((item) => item.id === id);
  const progress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);
  const updateProgress = useAppStore((state) => state.updateUnitTestingProgress);
  const setStepStatus = useAppStore((state) => state.setUnitTestingStepStatus);
  const saveExplanation = useAppStore((state) => state.saveUnitTestingExplanation);

  const [activeTab, setActiveTab] = useState('prompt');
  const [activeSourcePath, setActiveSourcePath] = useState('');
  const [testCode, setTestCode] = useState('');
  const [result, setResult] = useState<UnitTestingRunResult>();
  const [completion, setCompletion] = useState<Record<number, StepStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [behaviorProof, setBehaviorProof] = useState('');
  const [edgeCase, setEdgeCase] = useState('');
  const [brittleness, setBrittleness] = useState('');

  const entry = problem ? getUnitTestingProgress(progress, problem.id) : undefined;
  const steps = useMemo(() => (problem ? parseSteps(problem.testStubFile.contents) : []), [problem]);
  const regionSteps = useMemo(() => (problem ? new Set(parseTodoRegions(problem.testStubFile.contents).map((region) => region.stepIndex)) : new Set<number>()), [problem]);

  useEffect(() => {
    if (!problem) return;
    let active = true;
    const draftKey = `unit-testing-${problem.id}-${problem.testStubFile.path}`;
    setActiveSourcePath(problem.sourceFiles[0]?.path ?? '');
    getDraft(draftKey).then((draft) => {
      if (!active) return;
      setTestCode(draft?.value ?? problem.testStubFile.contents);
    });
    setResult(undefined);
    if (entry?.explanation) {
      setBehaviorProof(entry.explanation.behaviorProof);
      setEdgeCase(entry.explanation.edgeCase);
      setBrittleness(entry.explanation.brittleness);
    } else {
      setBehaviorProof('');
      setEdgeCase('');
      setBrittleness('');
    }
    return () => {
      active = false;
    };
  }, [entry?.explanation, problem]);

  useEffect(() => {
    if (!problem) return;
    const nextCompletion = computeStepCompletion(testCode, problem.testStubFile.contents);
    setCompletion(nextCompletion);
    const timer = window.setTimeout(() => {
      Object.entries(nextCompletion).forEach(([stepIndex, status]) => {
        setStepStatus(problem.id, Number(stepIndex), status);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [problem, setStepStatus, testCode]);

  if (!problem || !entry) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Problem not found.</p>
        <Link className="text-sm text-ember-400" to="/unit-testing/catalog">Back to catalog</Link>
      </div>
    );
  }

  const activeStep = getFirstIncompleteStep(completion, steps, regionSteps);
  const activeSource = problem.sourceFiles.find((file) => file.path === activeSourcePath) ?? problem.sourceFiles[0];

  const onTestCodeChange = (next: string) => {
    setTestCode(next);
    void setDraft(`unit-testing-${problem.id}-${problem.testStubFile.path}`, next);
  };

  const runTests = async (submit: boolean) => {
    setIsRunning(true);
    const now = new Date().toISOString();
    updateProgress(problem.id, {
      attempts: entry.attempts + 1,
      lastAttemptedAt: now,
      startedAt: entry.startedAt ?? now
    });
    const nextResult = submit
      ? await submitUnitTestingSolution({ problem, testCode })
      : await runUnitTestingTests({ problem, testCode });
    setResult(nextResult);
    setIsRunning(false);
    if (submit && nextResult.ok) {
      updateProgress(problem.id, {
        passes: entry.passes + 1,
        lastPassedAt: now
      });
      setShowExplain(true);
      setActiveTab('review');
    }
    if (submit && nextResult.errorType === 'WEAK_TEST_FAILURE') {
      updateProgress(problem.id, {
        lastWeakFailureAt: now
      });
    }
  };

  const submitRating = () => {
    updateProgress(problem.id, updateScheduleGeneric(entry, difficulty, confidence));
  };

  const submitExplanation = () => {
    saveExplanation(problem.id, {
      behaviorProof: behaviorProof.trim(),
      edgeCase: edgeCase.trim(),
      brittleness: brittleness.trim()
    });
    setShowExplain(false);
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
            setTestCode(problem.testStubFile.contents);
            void setDraft(`unit-testing-${problem.id}-${problem.testStubFile.path}`, problem.testStubFile.contents);
            setResult(undefined);
          }}
        >
          Reset
        </button>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'prompt' && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-2xl p-6">
            <ReactMarkdown className="space-y-4 text-sm text-mist-200">{problem.promptMarkdown}</ReactMarkdown>
            <div className="mt-6">
              <h3 className="font-display text-lg">Requirements</h3>
              <ul className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.requirements.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Constraints</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.constraints.map((item) => <li key={item}>• {item}</li>)}
            </ul>
            <h3 className="mt-6 font-display text-lg">Visible checks</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.testsMeta.visibleChecks.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'plan' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Testing strategy</h3>
            <ReactMarkdown className="mt-3 space-y-4 text-sm text-mist-200">{problem.solutionNotes.testingStrategyMarkdown}</ReactMarkdown>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Plan</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              <li>Start with the clearest happy-path behavior.</li>
              <li>Keep Arrange, Act, and Assert easy to scan.</li>
              <li>Add the smallest edge case that proves the contract boundary.</li>
              <li>Avoid brittle implementation-detail assertions.</li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'solve' && (
        <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <div className="mt-4">
                <StepList steps={steps} completion={completion} activeStep={activeStep} showDescription={settings.hintLevel > 0} />
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Source files</h3>
              <div className="mt-3 space-y-2 text-sm">
                {problem.sourceFiles.map((file) => (
                  <button key={file.path} className={`block w-full rounded-xl border px-3 py-2 text-left ${activeSource?.path === file.path ? 'border-ember-500/50 bg-white/5' : 'border-white/10'}`} onClick={() => setActiveSourcePath(file.path)}>
                    {file.path.replace('/src/', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-mist-300">
                <span>{activeSource?.path}</span>
                <span>Read-only source</span>
              </div>
              <CodeEditor value={activeSource?.contents ?? ''} language="typescript" onChange={() => {}} readOnly path={`inmemory://unit-source${activeSource?.path ?? '/src/source.ts'}`} suppressDiagnostics />
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Editable test file</p>
                  <p className="text-sm text-mist-200">{problem.testStubFile.path.replace('/src/', '')}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => void runTests(false)} disabled={isRunning}>Run tests</button>
                  <button className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" onClick={() => void runTests(true)} disabled={isRunning}>Submit</button>
                </div>
              </div>
              <CodeEditor value={testCode} language="typescript" onChange={onTestCodeChange} path={`inmemory://unit-test${problem.testStubFile.path}`} suppressDiagnostics />
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-display text-lg">Test results</h3>
              <div className="mt-3">
                <UnitTestingResults result={result} />
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'review' && (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Reference test file</h3>
            <div className="mt-4">
              <CodeEditor value={problem.referenceTestFile.contents} language="typescript" onChange={() => {}} readOnly path={`inmemory://unit-reference${problem.referenceTestFile.path}`} suppressDiagnostics />
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg">Why these assertions matter</h3>
              <ReactMarkdown className="mt-3 space-y-4 text-sm text-mist-200">{problem.solutionNotes.whyTheseAssertionsMarkdown}</ReactMarkdown>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg">Edge cases and pitfalls</h3>
              <ReactMarkdown className="mt-3 space-y-4 text-sm text-mist-200">{problem.solutionNotes.edgeCasesMarkdown}</ReactMarkdown>
              <ul className="mt-4 space-y-2 text-sm text-mist-200">
                {problem.commonPitfalls.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg">Retention</h3>
        <p className="mt-3 text-sm text-mist-200">Save a spaced-repetition rating after you pass.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Difficulty (1-5)</label>
            <input className="mt-2 w-full" type="range" min={1} max={5} value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)</label>
            <input className="mt-2 w-full" type="range" min={1} max={5} value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} />
          </div>
        </div>
        <button className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={submitRating}>Save review rating</button>
      </section>

      {showExplain && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-950/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-ink-900 p-6">
            <h2 className="font-display text-xl font-semibold">Explain it back</h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm text-mist-200">What behavior did your tests prove?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={behaviorProof} onChange={(event) => setBehaviorProof(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-mist-200">What edge case mattered most?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={edgeCase} onChange={(event) => setEdgeCase(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-mist-200">What would make this test brittle?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={brittleness} onChange={(event) => setBrittleness(event.target.value)} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => setShowExplain(false)}>Skip</button>
              <button className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" onClick={submitExplanation}>Save reflection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitTestingDetail;
