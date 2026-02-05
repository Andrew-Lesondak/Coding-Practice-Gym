import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CodeEditor from '../components/CodeEditor';
import TestResults from '../components/TestResults';
import { dsaDrills } from '../data/dsaDrills';
import { problems } from '../data/problems';
import { parseEditRegions, isEditAllowed } from '../lib/dsaDrillEditRegions';
import { runInWorker, RunResponse } from '../lib/runnerClient';
import { saveDrillAttempt } from '../lib/dsaDrillStorage';
import { getDrillTests } from '../lib/dsaDrillRunner';

const DSADrillDetail = () => {
  const { id } = useParams();
  const drill = dsaDrills.find((item) => item.id === id);
  const problem = problems.find((item) => item.id === drill?.problemId);
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<RunResponse | undefined>();
  const [remaining, setRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [patternText, setPatternText] = useState('');
  const [explainText, setExplainText] = useState('');
  const [confidence, setConfidence] = useState(3);
  const prevCodeRef = useRef('');
  const [savedAttempt, setSavedAttempt] = useState(false);

  useEffect(() => {
    if (!drill) return;
    setCode(drill.starterCode);
    prevCodeRef.current = drill.starterCode;
    setRemaining(drill.timeLimitMinutes * 60);
  }, [drill]);

  useEffect(() => {
    if (!started || ended) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, ended]);

  useEffect(() => {
    if (!started || ended) return;
    if (remaining === 0) {
      setEnded(true);
    }
  }, [remaining, started, ended]);

  useEffect(() => {
    if (ended && drill?.drillType !== 'pattern' && problem) {
      runTests();
    }
  }, [ended]);

  useEffect(() => {
    if (!ended || savedAttempt || !drill) return;
    const durationSeconds = Math.max(0, drill.timeLimitMinutes * 60 - remaining);
    if (drill.drillType === 'pattern') {
      const passed = Boolean(patternText.trim() && explainText.trim());
      saveDrillAttempt({
        drillId: drill.id,
        problemId: drill.problemId,
        drillType: drill.drillType,
        difficulty: drill.difficulty,
        completedAt: new Date().toISOString(),
        durationSeconds,
        passed,
        confidence
      });
      setSavedAttempt(true);
      return;
    }
    if (runResult) {
      saveDrillAttempt({
        drillId: drill.id,
        problemId: drill.problemId,
        drillType: drill.drillType,
        difficulty: drill.difficulty,
        completedAt: new Date().toISOString(),
        durationSeconds,
        passed: runResult.ok,
        confidence
      });
      setSavedAttempt(true);
    }
  }, [ended, savedAttempt, drill, runResult, patternText, explainText, confidence, remaining]);

  if (!drill || !problem) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Drill not found.</p>
        <Link className="text-sm text-ember-400" to="/dsa/drills">
          Back
        </Link>
      </div>
    );
  }

  const timeLabel = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  const regions = useMemo(() => parseEditRegions(code, drill.allowedEditRegions), [code, drill]);

  const onCodeChange = (next: string) => {
    if (!started) setStarted(true);
    if (ended) return;
    if (!isEditAllowed(prevCodeRef.current, next, regions)) {
      return;
    }
    setCode(next);
    prevCodeRef.current = next;
  };

  const runTests = async () => {
    if (!problem) return;
    const tests = getDrillTests(problem, drill);
    const result = await runInWorker({
      code,
      functionName: problem.functionName,
      tests,
      language: 'ts',
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat
    });
    setRunResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{drill.drillType}</p>
          <h1 className="font-display text-2xl font-semibold">{drill.id}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Time remaining</p>
          <p className="text-xl font-semibold">{timeLabel}</p>
        </div>
      </div>

      {ended ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Your work</h3>
            {drill.drillType === 'pattern' ? (
              <div className="mt-3 text-sm text-mist-200">
                <p><strong>Pattern:</strong> {patternText}</p>
                <p><strong>Explanation:</strong> {explainText}</p>
              </div>
            ) : (
              <pre className="mt-3 whitespace-pre-wrap text-xs text-mist-200">{code}</pre>
            )}
            <div className="mt-4">
              <h3 className="font-display text-lg">Explain back</h3>
              <label className="block text-sm">
                What pattern was this?
                <textarea className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2" value={patternText} onChange={(e) => setPatternText(e.target.value)} />
              </label>
              <label className="mt-4 block text-sm">
                What invariant mattered?
                <textarea className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2" value={explainText} onChange={(e) => setExplainText(e.target.value)} />
              </label>
              <div className="mt-4">
                <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)</label>
                <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="mt-2 w-full" />
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Reference snippet</h3>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-mist-200">{drill.referenceSnippet}</pre>
            {runResult && (
              <div className="mt-4">
                <TestResults result={runResult} />
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <ReactMarkdown className="text-sm text-mist-200 space-y-3">{drill.promptMarkdown}</ReactMarkdown>
            </div>
            {drill.drillType === 'pattern' ? (
              <div className="glass rounded-2xl p-5 space-y-4">
                <label className="text-sm">Pattern(s)
                  <input className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={patternText} onChange={(e) => { if (!started) setStarted(true); setPatternText(e.target.value);} } />
                </label>
                <label className="text-sm">Explanation (2-3 sentences)
                  <textarea className="mt-2 h-24 w-full rounded-xl border border-white/10 bg-transparent p-2" value={explainText} onChange={(e) => { if (!started) setStarted(true); setExplainText(e.target.value);} } />
                </label>
              </div>
            ) : (
              <CodeEditor value={code} language="typescript" onChange={onCodeChange} />
            )}
            {drill.drillType !== 'pattern' && (
              <div className="flex gap-2">
                <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={runTests}>
                  Run tests
                </button>
                <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={() => setEnded(true)}>
                  End drill
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {runResult && <TestResults result={runResult} />}
          </div>
        </section>
      )}
    </div>
  );
};

export default DSADrillDetail;
