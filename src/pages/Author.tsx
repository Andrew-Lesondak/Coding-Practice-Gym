import { useEffect, useMemo, useState } from 'react';
import { Problem, TestCase } from '../types/problem';
import { useAppStore } from '../store/useAppStore';
import { loadOverlayPack, saveOverlayPack, OverlayPack } from '../lib/problemPack';
import {
  validateGuidedStubCompile,
  validateReferenceSolution,
  validateStepMarkers,
  validateTests,
  ValidationMessage
} from '../lib/authorValidation';
import { stableStringify } from '../lib/runnerUtils';

const emptyTest = (): TestCase => ({ name: 'test', input: '[]', expected: 'null' });

const defaultProblem = (): Problem => ({
  id: '',
  title: '',
  difficulty: 'Easy',
  patterns: [],
  statementMarkdown: '',
  planMarkdown: '',
  examples: [],
  constraints: [],
  functionName: '',
  referenceSolution: '',
  guidedStub: '',
  tests: { visible: [emptyTest()], hidden: [] },
  metadata: {
    timeComplexity: '',
    spaceComplexity: '',
    commonPitfalls: [],
    recallQuestions: []
  }
});

const Author = () => {
  const [draft, setDraft] = useState<Problem>(defaultProblem());
  const [messages, setMessages] = useState<ValidationMessage[]>([]);
  const [isValidatingRef, setIsValidatingRef] = useState(false);
  const [refMessages, setRefMessages] = useState<ValidationMessage[]>([]);
  const [jsonBlob, setJsonBlob] = useState('');
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const toggleOverlay = useAppStore((state) => state.toggleOverlay);
  const bumpOverlayVersion = useAppStore((state) => state.bumpOverlayVersion);

  const syncMessages = useMemo(() => {
    const msgs: ValidationMessage[] = [];
    msgs.push(...validateStepMarkers(draft.guidedStub));
    msgs.push(...validateTests([...draft.tests.visible, ...draft.tests.hidden]));
    msgs.push(...validateGuidedStubCompile(draft.guidedStub));
    return msgs;
  }, [draft.guidedStub, draft.tests.hidden, draft.tests.visible]);

  useEffect(() => {
    setMessages(syncMessages);
  }, [syncMessages]);

  useEffect(() => {
    let timer: number | undefined;
    if (!draft.referenceSolution || !draft.functionName) {
      setRefMessages([{ type: 'error', message: 'Reference solution and function name are required.' }]);
      return;
    }
    setIsValidatingRef(true);
    timer = window.setTimeout(() => {
      validateReferenceSolution(draft).then((msgs) => {
        setRefMessages(msgs.length > 0 ? msgs : [{ type: 'warning', message: 'Reference solution passed all tests.' }]);
        setIsValidatingRef(false);
      });
    }, 400);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [draft]);

  const hasBlockingErrors = messages.some((m) => m.type === 'error') || refMessages.some((m) => m.type === 'error');

  const updateDraft = (patch: Partial<Problem>) => setDraft((prev) => ({ ...prev, ...patch }));

  const updateTests = (kind: 'visible' | 'hidden', index: number, patch: Partial<TestCase>) => {
    setDraft((prev) => {
      const next = [...prev.tests[kind]];
      next[index] = { ...next[index], ...patch } as TestCase;
      return { ...prev, tests: { ...prev.tests, [kind]: next } };
    });
  };

  const addTest = (kind: 'visible' | 'hidden') => {
    setDraft((prev) => ({
      ...prev,
      tests: { ...prev.tests, [kind]: [...prev.tests[kind], emptyTest()] }
    }));
  };

  const removeTest = (kind: 'visible' | 'hidden', index: number) => {
    setDraft((prev) => {
      const next = prev.tests[kind].filter((_, idx) => idx !== index);
      return { ...prev, tests: { ...prev.tests, [kind]: next } };
    });
  };

  const exportJson = () => {
    const payload = JSON.stringify(draft, null, 2);
    setJsonBlob(payload);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonBlob) as Problem;
      setDraft(parsed);
    } catch {
      setMessages((prev) => [...prev, { type: 'error', message: 'Invalid JSON for import.' }]);
    }
  };

  const copyJson = async () => {
    const payload = JSON.stringify(draft, null, 2);
    await navigator.clipboard.writeText(payload);
    setJsonBlob(payload);
  };

  const saveOverlay = () => {
    if (!import.meta.env.DEV) return;
    if (hasBlockingErrors) return;
    const existing = loadOverlayPack();
    const merged = existing?.problems ?? [];
    const next = merged.filter((problem) => problem.id !== draft.id);
    next.push(draft);
    const pack: OverlayPack = {
      problems: next,
      updatedAt: new Date().toISOString(),
      version: 1
    };
    saveOverlayPack(pack);
    bumpOverlayVersion();
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Problem authoring (local)</h1>
        <p className="mt-2 text-sm text-mist-200">
          Draft a problem, validate it live, and save to a local overlay pack in dev mode.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Overlay pack</p>
            <p className="text-sm text-mist-200">Enable overlay problems in the main app.</p>
          </div>
          <button
            onClick={() => toggleOverlay(!overlayEnabled)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              overlayEnabled ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-mist-200'
            }`}
          >
            {overlayEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              ID
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.id}
                onChange={(e) => updateDraft({ id: e.target.value.trim() })}
              />
            </label>
            <label className="text-sm">
              Title
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Difficulty
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
                value={draft.difficulty}
                onChange={(e) => updateDraft({ difficulty: e.target.value as Problem['difficulty'] })}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <label className="text-sm">
              Patterns (comma separated)
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.patterns.join(', ')}
                onChange={(e) => updateDraft({ patterns: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })}
              />
            </label>
            <label className="text-sm">
              Function name
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.functionName}
                onChange={(e) => updateDraft({ functionName: e.target.value.trim() })}
              />
            </label>
          </div>

          <label className="text-sm">
            Statement (Markdown)
            <textarea
              className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
              value={draft.statementMarkdown}
              onChange={(e) => updateDraft({ statementMarkdown: e.target.value })}
            />
          </label>

          <label className="text-sm">
            Constraints (one per line)
            <textarea
              className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
              value={draft.constraints.join('\n')}
              onChange={(e) => updateDraft({ constraints: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })}
            />
          </label>

          <label className="text-sm">
            Guided stub
            <textarea
              className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
              value={draft.guidedStub}
              onChange={(e) => updateDraft({ guidedStub: e.target.value })}
            />
          </label>

          <label className="text-sm">
            Reference solution
            <textarea
              className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
              value={draft.referenceSolution}
              onChange={(e) => updateDraft({ referenceSolution: e.target.value })}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Time complexity
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.metadata.timeComplexity}
                onChange={(e) => updateDraft({ metadata: { ...draft.metadata, timeComplexity: e.target.value } })}
              />
            </label>
            <label className="text-sm">
              Space complexity
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.metadata.spaceComplexity}
                onChange={(e) => updateDraft({ metadata: { ...draft.metadata, spaceComplexity: e.target.value } })}
              />
            </label>
            <label className="text-sm">
              Common pitfalls (one per line)
              <textarea
                className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.metadata.commonPitfalls.join('\n')}
                onChange={(e) => updateDraft({
                  metadata: {
                    ...draft.metadata,
                    commonPitfalls: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                  }
                })}
              />
            </label>
            <label className="text-sm">
              Recall questions (one per line)
              <textarea
                className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.metadata.recallQuestions.join('\n')}
                onChange={(e) => updateDraft({
                  metadata: {
                    ...draft.metadata,
                    recallQuestions: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                  }
                })}
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg">Validation</h3>
            <div className="mt-3 space-y-2 text-sm">
              {messages.concat(refMessages).length === 0 && <p className="text-mist-200">All checks passed.</p>}
              {messages.concat(refMessages).map((msg, idx) => (
                <p key={`${msg.message}-${idx}`} className={msg.type === 'error' ? 'text-rose-300' : 'text-amber-300'}>
                  {msg.message}
                </p>
              ))}
              {isValidatingRef && <p className="text-xs text-mist-300">Running reference solution...</p>}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-lg">Tests</h3>
            {(['visible', 'hidden'] as const).map((kind) => (
              <div key={kind} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-mist-300">{kind} tests</p>
                  <button
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200"
                    onClick={() => addTest(kind)}
                  >
                    Add
                  </button>
                </div>
                {draft.tests[kind].map((test, index) => (
                  <div key={`${kind}-${index}`} className="rounded-xl border border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <input
                        className="w-full rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs"
                        value={test.name}
                        onChange={(e) => updateTests(kind, index, { name: e.target.value })}
                      />
                      <button
                        className="ml-2 text-xs text-rose-300"
                        onClick={() => removeTest(kind, index)}
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      className="mt-2 h-16 w-full rounded-lg border border-white/10 bg-transparent p-2 text-xs font-mono"
                      value={test.input}
                      onChange={(e) => updateTests(kind, index, { input: e.target.value })}
                    />
                    <textarea
                      className="mt-2 h-16 w-full rounded-lg border border-white/10 bg-transparent p-2 text-xs font-mono"
                      value={test.expected}
                      onChange={(e) => updateTests(kind, index, { expected: e.target.value })}
                    />
                    <p className="mt-1 text-[10px] text-mist-300">
                      Preview: {stableStringify({ input: test.input, expected: test.expected })}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-lg">Import / Export</h3>
            <textarea
              className="h-32 w-full rounded-xl border border-white/10 bg-transparent p-2 text-xs font-mono"
              value={jsonBlob}
              onChange={(e) => setJsonBlob(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200" onClick={exportJson}>
                Export JSON
              </button>
              <button className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200" onClick={importJson}>
                Import JSON
              </button>
              <button className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200" onClick={copyJson}>
                Copy JSON to clipboard
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <button
              className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
              onClick={saveOverlay}
              disabled={hasBlockingErrors || !import.meta.env.DEV}
            >
              Save to local problem pack (dev only)
            </button>
            {hasBlockingErrors && (
              <p className="mt-2 text-xs text-rose-300">Fix validation errors before saving.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Author;
