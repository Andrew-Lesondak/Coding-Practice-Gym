import { useEffect, useMemo, useState } from 'react';
import { Problem, TestCase } from '../types/problem';
import { SystemDesignPrompt } from '../types/systemDesign';
import { SystemDesignDrill } from '../types/systemDesignDrill';
import { useAppStore } from '../store/useAppStore';
import { loadOverlayPack, saveOverlayPack, OverlayPack } from '../lib/problemPack';
import {
  validateDesignStepMarkers,
  validateGuidedStubCompile,
  validateReferenceSolution,
  validateStepMarkers,
  validateTests,
  ValidationMessage,
  validateRubric,
  validateDrill
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

const defaultSystemDesignPrompt = (): SystemDesignPrompt => ({
  id: '',
  title: '',
  difficulty: 'easy',
  domain: '',
  tags: [],
  promptMarkdown: '',
  requirements: { functional: [], nonFunctional: [] },
  scale: { traffic: '', storage: '', retention: '' },
  constraints: [],
  guidedDesignStubMarkdown: '',
  rubric: { categories: [] },
  reference: { overviewMarkdown: '', keyDecisions: [] },
  recallQuestions: [],
  commonPitfalls: []
});

const Author = () => {
  const [mode, setMode] = useState<'dsa' | 'system' | 'drill'>('dsa');
  const [draft, setDraft] = useState<Problem>(defaultProblem());
  const [designDraft, setDesignDraft] = useState<SystemDesignPrompt>(defaultSystemDesignPrompt());
  const [drillDraft, setDrillDraft] = useState<SystemDesignDrill>({
    id: '',
    title: '',
    type: 'requirements',
    difficulty: 'easy',
    promptMarkdown: '',
    stepsIncluded: [1],
    starterTemplateMarkdown: '',
    rubricSubset: { categoryIds: [], itemIds: [] },
    referenceNotes: [],
    timeLimitMinutes: 5,
    recallQuestions: []
  });
  const [messages, setMessages] = useState<ValidationMessage[]>([]);
  const [isValidatingRef, setIsValidatingRef] = useState(false);
  const [refMessages, setRefMessages] = useState<ValidationMessage[]>([]);
  const [jsonBlob, setJsonBlob] = useState('');
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const toggleOverlay = useAppStore((state) => state.toggleOverlay);
  const bumpOverlayVersion = useAppStore((state) => state.bumpOverlayVersion);

  const syncMessages = useMemo(() => {
    const msgs: ValidationMessage[] = [];
    if (mode === 'dsa') {
      msgs.push(...validateStepMarkers(draft.guidedStub));
      msgs.push(...validateTests([...draft.tests.visible, ...draft.tests.hidden]));
      msgs.push(...validateGuidedStubCompile(draft.guidedStub));
    } else if (mode === 'system') {
      msgs.push(...validateDesignStepMarkers(designDraft.guidedDesignStubMarkdown));
      msgs.push(...validateRubric(designDraft.rubric));
    } else {
      msgs.push(...validateDesignStepMarkers(drillDraft.starterTemplateMarkdown));
      msgs.push(...validateDrill(drillDraft));
    }
    return msgs;
  }, [
    mode,
    draft.guidedStub,
    draft.tests.hidden,
    draft.tests.visible,
    designDraft.guidedDesignStubMarkdown,
    designDraft.rubric
  ]);

  useEffect(() => {
    setMessages(syncMessages);
  }, [syncMessages]);

  useEffect(() => {
    let timer: number | undefined;
    if (mode !== 'dsa') {
      setRefMessages([]);
      return;
    }
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
  }, [draft, mode]);

  const hasBlockingErrors = messages.some((m) => m.type === 'error') || refMessages.some((m) => m.type === 'error');

  const updateDraft = (patch: Partial<Problem>) => setDraft((prev) => ({ ...prev, ...patch }));
  const updateDesignDraft = (patch: Partial<SystemDesignPrompt>) => setDesignDraft((prev) => ({ ...prev, ...patch }));
  const updateDrillDraft = (patch: Partial<SystemDesignDrill>) => setDrillDraft((prev) => ({ ...prev, ...patch }));

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
    const payload = JSON.stringify(mode === 'dsa' ? draft : mode === 'system' ? designDraft : drillDraft, null, 2);
    setJsonBlob(payload);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonBlob) as unknown;
      if (mode === 'dsa') {
        setDraft(parsed as Problem);
      } else if (mode === 'system') {
        setDesignDraft(parsed as SystemDesignPrompt);
      } else {
        setDrillDraft(parsed as SystemDesignDrill);
      }
    } catch {
      setMessages((prev) => [...prev, { type: 'error', message: 'Invalid JSON for import.' }]);
    }
  };

  const copyJson = async () => {
    const payload = JSON.stringify(mode === 'dsa' ? draft : mode === 'system' ? designDraft : drillDraft, null, 2);
    await navigator.clipboard.writeText(payload);
    setJsonBlob(payload);
  };

  const saveOverlay = () => {
    if (!import.meta.env.DEV) return;
    if (hasBlockingErrors) return;
    const existing = loadOverlayPack();
    const mergedProblems = existing?.problems ?? [];
    const mergedDesign = existing?.systemDesignPrompts ?? [];
    const mergedDrills = existing?.systemDesignDrills ?? [];
    let nextProblems = mergedProblems;
    let nextDesign = mergedDesign;
    let nextDrills = mergedDrills;
    if (mode === 'dsa') {
      nextProblems = mergedProblems.filter((problem) => problem.id !== draft.id);
      nextProblems.push(draft);
    } else if (mode === 'system') {
      nextDesign = mergedDesign.filter((prompt) => prompt.id !== designDraft.id);
      nextDesign.push(designDraft);
    } else {
      nextDrills = mergedDrills.filter((drill) => drill.id !== drillDraft.id);
      nextDrills.push(drillDraft);
    }
    const pack: OverlayPack = {
      problems: nextProblems,
      systemDesignPrompts: nextDesign,
      systemDesignDrills: nextDrills,
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
        <div className="flex gap-2">
          <button
            className={`rounded-full border px-4 py-2 text-xs ${
              mode === 'dsa' ? 'border-ember-500/60 bg-ember-500/10 text-ember-300' : 'border-white/10 text-mist-200'
            }`}
            onClick={() => setMode('dsa')}
          >
            DSA
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-xs ${
              mode === 'system' ? 'border-ember-500/60 bg-ember-500/10 text-ember-300' : 'border-white/10 text-mist-200'
            }`}
            onClick={() => setMode('system')}
          >
            System Design
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-xs ${
              mode === 'drill' ? 'border-ember-500/60 bg-ember-500/10 text-ember-300' : 'border-white/10 text-mist-200'
            }`}
            onClick={() => setMode('drill')}
          >
            Drills
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-2xl p-6 space-y-5">
          {mode === 'dsa' ? (
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
          ) : mode === 'system' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                ID
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.id}
                  onChange={(e) => updateDesignDraft({ id: e.target.value.trim() })}
                />
              </label>
              <label className="text-sm">
                Title
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.title}
                  onChange={(e) => updateDesignDraft({ title: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Difficulty
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
                  value={designDraft.difficulty}
                  onChange={(e) => updateDesignDraft({ difficulty: e.target.value as SystemDesignPrompt['difficulty'] })}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </label>
              <label className="text-sm">
                Domain
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.domain}
                  onChange={(e) => updateDesignDraft({ domain: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Tags (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.tags.join(', ')}
                  onChange={(e) =>
                    updateDesignDraft({ tags: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })
                  }
                />
              </label>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                ID
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.id}
                  onChange={(e) => updateDrillDraft({ id: e.target.value.trim() })}
                />
              </label>
              <label className="text-sm">
                Title
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.title}
                  onChange={(e) => updateDrillDraft({ title: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Type
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
                  value={drillDraft.type}
                  onChange={(e) => updateDrillDraft({ type: e.target.value as SystemDesignDrill['type'] })}
                >
                  <option value="requirements">requirements</option>
                  <option value="api">api</option>
                  <option value="data-scaling">data-scaling</option>
                  <option value="reliability">reliability</option>
                  <option value="tradeoffs">tradeoffs</option>
                </select>
              </label>
              <label className="text-sm">
                Difficulty
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
                  value={drillDraft.difficulty}
                  onChange={(e) => updateDrillDraft({ difficulty: e.target.value as SystemDesignDrill['difficulty'] })}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </label>
              <label className="text-sm">
                Related prompt ID (optional)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.relatedPromptId ?? ''}
                  onChange={(e) => updateDrillDraft({ relatedPromptId: e.target.value.trim() || undefined })}
                />
              </label>
            </div>
          )}

          {mode === 'dsa' ? (
            <label className="text-sm">
              Statement (Markdown)
              <textarea
                className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={draft.statementMarkdown}
                onChange={(e) => updateDraft({ statementMarkdown: e.target.value })}
              />
            </label>
          ) : mode === 'system' ? (
            <label className="text-sm">
              Prompt (Markdown)
              <textarea
                className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={designDraft.promptMarkdown}
                onChange={(e) => updateDesignDraft({ promptMarkdown: e.target.value })}
              />
            </label>
          ) : (
            <label className="text-sm">
              Prompt (Markdown)
              <textarea
                className="mt-2 h-28 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={drillDraft.promptMarkdown}
                onChange={(e) => updateDrillDraft({ promptMarkdown: e.target.value })}
              />
            </label>
          )}

          <label className="text-sm">
            Constraints (one per line)
            <textarea
              className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
              value={mode === 'dsa' ? draft.constraints.join('\n') : mode === 'system' ? designDraft.constraints.join('\n') : ''}
              onChange={(e) =>
                mode === 'dsa'
                  ? updateDraft({ constraints: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })
                  : mode === 'system' ? updateDesignDraft({
                      constraints: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                    }) : undefined
              }
            />
          </label>

          {mode === 'dsa' ? (
            <label className="text-sm">
              Guided stub
              <textarea
                className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
                value={draft.guidedStub}
                onChange={(e) => updateDraft({ guidedStub: e.target.value })}
              />
            </label>
          ) : mode === 'system' ? (
            <label className="text-sm">
              Guided design stub (Markdown)
              <textarea
                className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
                value={designDraft.guidedDesignStubMarkdown}
                onChange={(e) => updateDesignDraft({ guidedDesignStubMarkdown: e.target.value })}
              />
            </label>
          ) : (
            <label className="text-sm">
              Starter template (Markdown)
              <textarea
                className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
                value={drillDraft.starterTemplateMarkdown}
                onChange={(e) => updateDrillDraft({ starterTemplateMarkdown: e.target.value })}
              />
            </label>
          )}

          {mode === 'drill' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Steps included (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.stepsIncluded.join(', ')}
                  onChange={(e) =>
                    updateDrillDraft({
                      stepsIncluded: e.target.value
                        .split(',')
                        .map((v) => Number(v.trim()))
                        .filter((v) => !Number.isNaN(v))
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Time limit (minutes)
                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.timeLimitMinutes}
                  onChange={(e) => updateDrillDraft({ timeLimitMinutes: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm">
                Rubric category IDs (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.rubricSubset.categoryIds.join(', ')}
                  onChange={(e) =>
                    updateDrillDraft({
                      rubricSubset: {
                        ...drillDraft.rubricSubset,
                        categoryIds: e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                      }
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Rubric item IDs (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.rubricSubset.itemIds.join(', ')}
                  onChange={(e) =>
                    updateDrillDraft({
                      rubricSubset: {
                        ...drillDraft.rubricSubset,
                        itemIds: e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                      }
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Reference notes (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.referenceNotes.join('\n')}
                  onChange={(e) =>
                    updateDrillDraft({
                      referenceNotes: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Recall questions (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={drillDraft.recallQuestions.join('\n')}
                  onChange={(e) =>
                    updateDrillDraft({
                      recallQuestions: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                    })
                  }
                />
              </label>
            </div>
          )}

          {mode === 'dsa' ? (
            <label className="text-sm">
              Reference solution
              <textarea
                className="mt-2 h-48 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm font-mono"
                value={draft.referenceSolution}
                onChange={(e) => updateDraft({ referenceSolution: e.target.value })}
              />
            </label>
          ) : (
            <label className="text-sm">
              Reference overview (Markdown)
              <textarea
                className="mt-2 h-32 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                value={designDraft.reference.overviewMarkdown}
                onChange={(e) =>
                  updateDesignDraft({ reference: { ...designDraft.reference, overviewMarkdown: e.target.value } })
                }
              />
            </label>
          )}

          {mode === 'dsa' ? (
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
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Functional requirements (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.requirements.functional.join('\n')}
                  onChange={(e) =>
                    updateDesignDraft({
                      requirements: {
                        ...designDraft.requirements,
                        functional: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                      }
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Non-functional requirements (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.requirements.nonFunctional.join('\n')}
                  onChange={(e) =>
                    updateDesignDraft({
                      requirements: {
                        ...designDraft.requirements,
                        nonFunctional: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                      }
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Scale: traffic
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.scale.traffic}
                  onChange={(e) =>
                    updateDesignDraft({ scale: { ...designDraft.scale, traffic: e.target.value } })
                  }
                />
              </label>
              <label className="text-sm">
                Scale: storage
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.scale.storage}
                  onChange={(e) =>
                    updateDesignDraft({ scale: { ...designDraft.scale, storage: e.target.value } })
                  }
                />
              </label>
              <label className="text-sm">
                Scale: retention
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.scale.retention}
                  onChange={(e) =>
                    updateDesignDraft({ scale: { ...designDraft.scale, retention: e.target.value } })
                  }
                />
              </label>
              <label className="text-sm">
                Rubric JSON
                <textarea
                  className="mt-2 h-40 w-full rounded-xl border border-white/10 bg-transparent p-2 text-xs font-mono"
                  value={JSON.stringify(designDraft.rubric, null, 2)}
                  onChange={(e) => {
                    try {
                      const next = JSON.parse(e.target.value);
                      updateDesignDraft({ rubric: next });
                    } catch {
                      // ignore invalid JSON, validation will catch
                    }
                  }}
                />
              </label>
              <label className="text-sm">
                Recall questions (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.recallQuestions.join('\n')}
                  onChange={(e) =>
                    updateDesignDraft({
                      recallQuestions: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                    })
                  }
                />
              </label>
              <label className="text-sm">
                Common pitfalls (one per line)
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                  value={designDraft.commonPitfalls.join('\n')}
                  onChange={(e) =>
                    updateDesignDraft({
                      commonPitfalls: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                    })
                  }
                />
              </label>
            </div>
          )}
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

          {mode === 'dsa' && (
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
          )}

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
