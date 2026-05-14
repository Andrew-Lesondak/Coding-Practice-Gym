import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import CodeEditor from '../components/CodeEditor';
import DataStructureResults from '../components/DataStructureResults';
import { useDataStructureProblems } from '../lib/useDataStructureProblems';
import { computeStepCompletion, getFirstIncompleteStep, parseSteps, parseTodoRegions } from '../lib/guidedStub';
import { getDataStructureProgress, useAppStore } from '../store/useAppStore';
import { getDraft, setDraft } from '../storage/stores/editorDraftStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { formatExpectedComplexity, runDataStructureTests, submitDataStructureSolution, DataStructureRunResult } from '../lib/dataStructureRunner';
import { StepStatus } from '../types/progress';

const tabs = [
  { id: 'prompt', label: 'Prompt' },
  { id: 'plan', label: 'Plan' },
  { id: 'implement', label: 'Implement' },
  { id: 'review', label: 'Review' }
];

const getStepLineMap = (stub: string) => {
  const lines = stub.split('\n');
  const map: Record<number, number> = {};
  lines.forEach((line, index) => {
    const match = line.match(/\/\/\s*Step\s+(\d+(?:\.\d+)?)\s*:/);
    if (match) {
      map[Number(match[1])] = index + 1;
    }
  });
  return map;
};

const DataStructuresDetail = () => {
  const { id } = useParams();
  const problems = useDataStructureProblems();
  const problem = problems.find((item) => item.id === id);
  const progress = useAppStore((state) => state.progress);
  const settings = useAppStore((state) => state.settings);
  const updateProgress = useAppStore((state) => state.updateDataStructureProgress);
  const setStepStatus = useAppStore((state) => state.setDataStructureStepStatus);
  const saveExplanation = useAppStore((state) => state.saveDataStructureExplanation);

  const [activeTab, setActiveTab] = useState('prompt');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<DataStructureRunResult>();
  const [completion, setCompletion] = useState<Record<number, StepStatus>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [invariant, setInvariant] = useState('');
  const [operation, setOperation] = useState('');
  const [edgeCase, setEdgeCase] = useState('');
  const [selectedStep, setSelectedStep] = useState<number>();

  const entry = problem ? getDataStructureProgress(progress, problem.id) : undefined;
  const steps = useMemo(() => (problem ? parseSteps(problem.guidedStubTs) : []), [problem]);
  const regionSteps = useMemo(
    () => (problem ? new Set(parseTodoRegions(problem.guidedStubTs).map((region) => region.stepIndex)) : new Set<number>()),
    [problem]
  );
  const lineMap = useMemo(() => (problem ? getStepLineMap(problem.guidedStubTs) : {}), [problem]);

  useEffect(() => {
    if (!problem) return;
    let active = true;
    const draftKey = `data-structures-${problem.id}`;
    getDraft(draftKey).then((draft) => {
      if (!active) return;
      setCode(draft?.value ?? problem.guidedStubTs);
    });
    setResult(undefined);
    if (entry?.explanation) {
      setInvariant(entry.explanation.invariant);
      setOperation(entry.explanation.operation);
      setEdgeCase(entry.explanation.edgeCase);
    } else {
      setInvariant('');
      setOperation('');
      setEdgeCase('');
    }
    return () => {
      active = false;
    };
  }, [entry?.explanation, problem]);

  useEffect(() => {
    if (!problem) return;
    const nextCompletion = computeStepCompletion(code, problem.guidedStubTs);
    setCompletion(nextCompletion);
    const timer = window.setTimeout(() => {
      Object.entries(nextCompletion).forEach(([stepIndex, status]) => {
        setStepStatus(problem.id, Number(stepIndex), status);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [code, problem, setStepStatus]);

  if (!problem || !entry) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Problem not found.</p>
        <Link className="text-sm text-ember-400" to="/data-structures/catalog">Back to catalog</Link>
      </div>
    );
  }

  const activeStep = selectedStep ?? getFirstIncompleteStep(completion, steps, regionSteps);

  const onCodeChange = (next: string) => {
    setCode(next);
    void setDraft(`data-structures-${problem.id}`, next);
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
      ? await submitDataStructureSolution({ problem, code })
      : await runDataStructureTests({ problem, code });
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
  };

  const submitRating = () => {
    updateProgress(problem.id, updateScheduleGeneric(entry, difficulty, confidence));
  };

  const submitExplanation = () => {
    saveExplanation(problem.id, {
      invariant: invariant.trim(),
      operation: operation.trim(),
      edgeCase: edgeCase.trim()
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
            setCode(problem.guidedStubTs);
            void setDraft(`data-structures-${problem.id}`, problem.guidedStubTs);
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
            <h3 className="mt-6 font-display text-lg">Operations</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-mist-200">
              {problem.operations.map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1">{item}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'plan' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Core invariant</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.metadata.invariants.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Implementation plan</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              <li>Start by locking down the structure's empty-state representation.</li>
              <li>Implement the smallest write operation that changes the invariant.</li>
              <li>Verify read operations only expose public semantics.</li>
              <li>Check the edge cases where the structure transitions between empty and non-empty.</li>
            </ul>
            <h3 className="mt-6 font-display text-lg">Expected complexities</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.metadata.expectedComplexities.map((item) => <li key={item.operation}>• {formatExpectedComplexity(item)}</li>)}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'implement' && (
        <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <div className="mt-4">
                <StepList
                  steps={steps}
                  completion={completion}
                  activeStep={activeStep}
                  showDescription={settings.hintLevel > 0}
                  onSelect={(stepIndex) => setSelectedStep(stepIndex)}
                />
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Invariants</h3>
              <ul className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.metadata.invariants.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Operations checklist</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-mist-200">
                {problem.operations.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 px-3 py-1">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Implementation</p>
                <p className="text-sm text-mist-200">{problem.structures.join(' / ')}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => void runTests(false)} disabled={isRunning}>Run tests</button>
                <button className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" onClick={() => void runTests(true)} disabled={isRunning}>Submit</button>
              </div>
            </div>
            <CodeEditor
              value={code}
              language="typescript"
              onChange={onCodeChange}
              path={`inmemory://data-structures/${problem.id}.ts`}
              suppressDiagnostics
              revealLine={lineMap[activeStep]}
            />
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-display text-lg">Test results</h3>
            <div className="mt-3">
              <DataStructureResults result={result} />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'review' && (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Reference solution</h3>
            <div className="mt-4">
              <CodeEditor
                value={problem.referenceSolutionTs}
                language="typescript"
                onChange={() => {}}
                readOnly
                path={`inmemory://data-structures/reference/${problem.id}.ts`}
                suppressDiagnostics
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg">Complexity table</h3>
              <div className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.metadata.expectedComplexities.map((item) => (
                  <div key={item.operation} className="rounded-xl border border-white/10 p-3">
                    {formatExpectedComplexity(item)}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg">Invariants</h3>
              <ul className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.metadata.invariants.map((item) => <li key={item}>• {item}</li>)}
              </ul>
              <h3 className="mt-6 font-display text-lg">Common pitfalls</h3>
              <ul className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.metadata.commonPitfalls.map((item) => <li key={item}>• {item}</li>)}
              </ul>
              <h3 className="mt-6 font-display text-lg">Recall questions</h3>
              <ul className="mt-3 space-y-2 text-sm text-mist-200">
                {problem.metadata.recallQuestions.map((item) => <li key={item}>• {item}</li>)}
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
                <span className="text-sm text-mist-200">What invariant does this data structure maintain?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={invariant} onChange={(event) => setInvariant(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-mist-200">Which operation was easiest to get wrong?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={operation} onChange={(event) => setOperation(event.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-mist-200">What edge case should tests include?</span>
                <textarea className="mt-2 h-24 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm" value={edgeCase} onChange={(event) => setEdgeCase(event.target.value)} />
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

export default DataStructuresDetail;
