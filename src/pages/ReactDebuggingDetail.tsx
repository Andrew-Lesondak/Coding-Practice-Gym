import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import CodeEditor from '../components/CodeEditor';
import DebuggingRunResult from '../components/DebuggingRunResult';
import SolveTimerCard from '../components/SolveTimerCard';
import { searchDebuggingFiles, listDebuggingSymbols, runReactDebuggingPreview, runReactDebuggingTests, submitReactDebuggingSolution, PreviewResult, DebuggingResult, normalizeDebuggingPath } from '../lib/reactDebuggingRunner';
import { useReactDebuggingProblems } from '../lib/useReactDebuggingProblems';
import { getDraft, setDraft } from '../storage/stores/editorDraftStore';
import { getReactDebuggingProgress, useAppStore } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';

const REACT_DEBUGGING_TAB_KEY_PREFIX = 'coding-practice-gym-react-debugging-tab';

const tabs = [
  { id: 'brief', label: 'Brief' },
  { id: 'codebase', label: 'Codebase' },
  { id: 'run', label: 'Run' },
  { id: 'review', label: 'Review' }
];

const ReactDebuggingDetail = () => {
  const { id } = useParams();
  const problems = useReactDebuggingProblems();
  const problem = problems.find((item) => item.id === id);
  const progress = useAppStore((state) => state.progress);
  const updateProgress = useAppStore((state) => state.updateReactDebuggingProgress);
  const saveExplanation = useAppStore((state) => state.saveReactDebuggingExplanation);
  const [activeTab, setActiveTab] = useState(() => 'brief');
  const [activeFile, setActiveFile] = useState('');
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<PreviewResult>();
  const [testResult, setTestResult] = useState<DebuggingResult>();
  const [isRunning, setIsRunning] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [runOutputExpanded, setRunOutputExpanded] = useState(true);
  const [difficulty, setDifficulty] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [rootCause, setRootCause] = useState('');
  const [signal, setSignal] = useState('');
  const [edgeCase, setEdgeCase] = useState('');
  const previewHostRef = useRef<HTMLDivElement | null>(null);
  const previewDisposeRef = useRef<(() => void) | undefined>(undefined);

  const fileList = useMemo(() => (problem ? problem.codebase.files.map((file) => ({ ...file, path: normalizeDebuggingPath(file.path) })) : []), [problem]);
  const filteredFiles = useMemo(() => searchDebuggingFiles(fileList, search), [fileList, search]);
  const entry = problem ? getReactDebuggingProgress(progress, problem.id) : undefined;

  useEffect(() => {
    if (!problem) return;
    const savedTab = sessionStorage.getItem(`${REACT_DEBUGGING_TAB_KEY_PREFIX}-${problem.id}`);
    if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
    let active = true;
    const baseline = Object.fromEntries(fileList.map((file) => [file.path, file.contents]));
    setFiles(baseline);
    setActiveFile(fileList[0]?.path ?? '');
    setPreviewResult(undefined);
    setTestResult(undefined);
    const load = async () => {
      const next: Record<string, string> = {};
      for (const file of fileList) {
        const key = `react-debug-${problem.id}-${file.path}`;
        const saved = await getDraft(key);
        next[file.path] = saved?.value ?? file.contents;
      }
      if (!active) return;
      setFiles(next);
    };
    void load();
    if (entry?.explanation) {
      setRootCause(entry.explanation.rootCause);
      setSignal(entry.explanation.signal);
      setEdgeCase(entry.explanation.edgeCase);
    }
    return () => {
      active = false;
      previewDisposeRef.current?.();
    };
  }, [entry?.explanation, fileList, problem]);


  useEffect(() => {
    if (!problem) return;
    sessionStorage.setItem(`${REACT_DEBUGGING_TAB_KEY_PREFIX}-${problem.id}`, activeTab);
  }, [activeTab, problem]);

  if (!problem || !entry) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Challenge not found.</p>
        <Link className="text-sm text-ember-400" to="/react-debugging/catalog">Back to catalog</Link>
      </div>
    );
  }

  const activeFileMeta = fileList.find((file) => file.path === activeFile) ?? fileList[0];
  const currentFiles = Object.fromEntries(fileList.map((file) => [file.path, files[file.path] ?? file.contents]));
  const changedEdits = Object.fromEntries(
    fileList
      .filter((file) => (files[file.path] ?? file.contents) !== file.contents)
      .map((file) => [file.path, files[file.path] ?? file.contents])
  );
  const searchPaths = search.trim() ? new Set(filteredFiles.map((item) => item.path)) : null;
  const visibleFiles = searchPaths ? fileList.filter((file) => searchPaths.has(file.path)) : fileList;

  const persistFile = (path: string, value: string) => {
    const key = `react-debug-${problem.id}-${path}`;
    void setDraft(key, value);
  };

  const runPreview = async () => {
    if (!previewHostRef.current) return;
    previewDisposeRef.current?.();
    setIsRunning(true);
    setRunOutputExpanded(true);
    const result = await runReactDebuggingPreview({
      problem,
      edits: changedEdits,
      container: previewHostRef.current
    });
    previewDisposeRef.current = result.dispose;
    setPreviewResult(result);
    setIsRunning(false);
  };

  const runTests = async (submit: boolean) => {
    setIsRunning(true);
    setRunOutputExpanded(true);
    const now = new Date().toISOString();
    updateProgress(problem.id, {
      attempts: entry.attempts + 1,
      lastAttemptedAt: now,
      startedAt: entry.startedAt ?? now
    });
    const result = submit
      ? await submitReactDebuggingSolution({ problem, edits: changedEdits })
      : await runReactDebuggingTests({ problem, edits: changedEdits, testCode: problem.tests.visible });
    setTestResult(result);
    setIsRunning(false);
    if (!submit && result.ok && !entry.firstVisiblePassAt) {
      updateProgress(problem.id, { firstVisiblePassAt: now, lastVisiblePassAt: now });
    } else if (!submit && result.ok) {
      updateProgress(problem.id, { lastVisiblePassAt: now });
    }
    if (submit && result.ok) {
      updateProgress(problem.id, { passes: entry.passes + 1, lastPassedAt: now });
      setShowExplain(true);
      setActiveTab('review');
    }
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
            const next = Object.fromEntries(fileList.map((file) => [file.path, file.contents]));
            setFiles(next);
            fileList.forEach((file) => persistFile(file.path, file.contents));
            setPreviewResult(undefined);
            setTestResult(undefined);
          }}
        >
          Reset challenge
        </button>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'brief' && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-2xl p-6">
            <ReactMarkdown className="space-y-4 text-sm text-mist-200">{problem.briefMarkdown}</ReactMarkdown>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Interview mindset</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              <li>Reproduce the bug first.</li>
              <li>Isolate the component or hook that owns the wrong behavior.</li>
              <li>Inspect data flow before changing code.</li>
              <li>Make the minimal maintainable fix.</li>
              <li>Validate edge cases before submit.</li>
            </ul>
            <h3 className="mt-6 font-display text-lg">Repro hints</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {problem.reproductionHints.map((hint) => <li key={hint}>{hint}</li>)}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'codebase' && (
        <section className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
          <div className="glass rounded-2xl p-4">
            <input aria-label="file search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search across files" className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm" />
            <div className="mt-4 space-y-2">
              {visibleFiles.map((file) => (
                <button key={file.path} onClick={() => setActiveFile(file.path)} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${activeFile === file.path ? 'border-ember-500/50 bg-white/5' : 'border-white/10'}`}>
                  <div>{file.path.replace('/src/', '')}</div>
                  <div className="text-xs text-mist-400">{file.editable ? 'Editable' : 'Read-only'}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            {activeFileMeta && (
              <>
                <div className="mb-3 flex items-center justify-between text-xs text-mist-300">
                  <span>{activeFileMeta.path}</span>
                  <span>{activeFileMeta.editable ? 'Editable' : 'Read-only'}</span>
                </div>
                <CodeEditor
                  key={`${problem.id}:${activeFileMeta.path}:codebase`}
                  value={currentFiles[activeFileMeta.path] ?? activeFileMeta.contents}
                  language="typescript"
                  path={`inmemory://debug${activeFileMeta.path}`}
                  suppressDiagnostics
                  onChange={(value) => {
                    if (!activeFileMeta.editable) return;
                    setFiles((current) => ({ ...current, [activeFileMeta.path]: value }));
                    persistFile(activeFileMeta.path, value);
                  }}
                />
              </>
            )}
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="font-display text-lg">Symbols</h3>
            <div className="mt-3 space-y-2 text-sm text-mist-200">
              {(activeFileMeta ? listDebuggingSymbols(activeFileMeta) : []).map((symbol) => (
                <div key={symbol} className="rounded-xl border border-white/10 p-2">{symbol}</div>
              ))}
              {activeFileMeta && listDebuggingSymbols(activeFileMeta).length === 0 && <p className="text-mist-400">No exported symbols.</p>}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'run' && (
        <section className="grid w-full gap-6 lg:grid-cols-[220px_minmax(0,1fr)_400px]">
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="max-h-[420px] space-y-2 overflow-auto">
              {fileList.map((file) => (
                <button key={file.path} onClick={() => setActiveFile(file.path)} className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${activeFile === file.path ? 'border-ember-500/50 bg-white/5' : 'border-white/10'}`}>
                  {file.path.replace('/src/', '')}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            {activeFileMeta && (
              <>
                <div className="mb-3 flex items-center justify-between text-xs text-mist-300">
                  <span>{activeFileMeta.path}</span>
                  <span>{activeFileMeta.editable ? 'Editable' : 'Read-only'}</span>
                </div>
                <CodeEditor
                  key={`${problem.id}:${activeFileMeta.path}:run`}
                  value={currentFiles[activeFileMeta.path] ?? activeFileMeta.contents}
                  language="typescript"
                  path={`inmemory://debug${activeFileMeta.path}`}
                  suppressDiagnostics
                  onChange={(value) => {
                    if (!activeFileMeta.editable) return;
                    setFiles((current) => ({ ...current, [activeFileMeta.path]: value }));
                    persistFile(activeFileMeta.path, value);
                  }}
                />
              </>
            )}
          </div>
          <div className="space-y-6">
            <SolveTimerCard />
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" onClick={() => void runPreview()} disabled={isRunning}>Run app</button>
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => void runTests(false)} disabled={isRunning}>Run tests</button>
              <button className="rounded-full border border-emerald-400/30 px-4 py-2 text-xs text-emerald-200" onClick={() => void runTests(true)} disabled={isRunning}>Submit</button>
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => setFiles(Object.fromEntries(fileList.map((file) => [file.path, file.contents])))}>Reset challenge</button>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="glass rounded-2xl p-4">
                <h3 className="font-display text-lg">Preview</h3>
                <div className="relative mt-3 min-h-[240px] rounded-xl border border-white/10 bg-white p-4 text-ink-950">
                  <div ref={previewHostRef} className="min-h-[208px]" />
                  {!previewResult && (
                    <div className="absolute inset-4 flex items-start">
                      <p className="text-sm text-slate-500">Run the app to render the preview.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">Run output</h3>
                  <button
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200"
                    onClick={() => setRunOutputExpanded((prev) => !prev)}
                  >
                    {runOutputExpanded ? 'Hide' : 'Show'}
                  </button>
                </div>
                {runOutputExpanded && (
                  <div className="mt-3">
                    <DebuggingRunResult result={testResult} preview={previewResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'review' && (
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="glass rounded-2xl p-6 space-y-6">
            {entry.passes > 0 ? (
              <>
                <div>
                  <h3 className="font-display text-lg">Root cause</h3>
                  <ReactMarkdown className="mt-2 text-sm text-mist-200">{problem.solutionNotes.rootCauseMarkdown}</ReactMarkdown>
                </div>
                <div>
                  <h3 className="font-display text-lg">Fix summary</h3>
                  <ReactMarkdown className="mt-2 text-sm text-mist-200">{problem.solutionNotes.fixSummaryMarkdown}</ReactMarkdown>
                </div>
                <div>
                  <h3 className="font-display text-lg">Maintainability</h3>
                  <ul className="mt-2 space-y-2 text-sm text-mist-200">
                    {problem.maintainabilityNotes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-lg">Edge cases</h3>
                  <ReactMarkdown className="mt-2 text-sm text-mist-200">{problem.solutionNotes.edgeCasesMarkdown}</ReactMarkdown>
                </div>
                <div>
                  <h3 className="font-display text-lg">Recall questions</h3>
                  <ul className="mt-2 space-y-2 text-sm text-mist-200">
                    {problem.recallQuestions.map((question) => <li key={question}>{question}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-mist-300">Submit a passing solution to unlock the review.</p>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Explain it back</h3>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">What was the root cause?
                <textarea className="mt-2 min-h-[90px] w-full rounded-xl border border-white/10 bg-transparent p-3" value={rootCause} onChange={(event) => setRootCause(event.target.value)} />
              </label>
              <label className="block">What signal helped you find it?
                <textarea className="mt-2 min-h-[90px] w-full rounded-xl border border-white/10 bg-transparent p-3" value={signal} onChange={(event) => setSignal(event.target.value)} />
              </label>
              <label className="block">What edge case could have been missed?
                <textarea className="mt-2 min-h-[90px] w-full rounded-xl border border-white/10 bg-transparent p-3" value={edgeCase} onChange={(event) => setEdgeCase(event.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>Difficulty
                  <input aria-label="difficulty rating" type="range" min="1" max="5" value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} className="mt-2 w-full" />
                </label>
                <label>Confidence
                  <input aria-label="confidence rating" type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} className="mt-2 w-full" />
                </label>
              </div>
              <button
                className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                onClick={() => {
                  saveExplanation(problem.id, { rootCause: rootCause.trim(), signal: signal.trim(), edgeCase: edgeCase.trim() });
                  updateProgress(problem.id, updateScheduleGeneric(entry, difficulty, confidence));
                  setShowExplain(false);
                }}
              >
                Save review
              </button>
              {showExplain && <p className="text-xs text-emerald-300">Passing submit complete. Capture the debugging lesson while it is fresh.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ReactDebuggingDetail;
