import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Tabs from '../components/Tabs';
import StepList from '../components/StepList';
import MermaidEditor from '../components/MermaidEditor';
import SystemDesignRubric from '../components/SystemDesignRubric';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { computeDesignStepStatus, getStepIndexPosition, parseDesignSteps } from '../lib/systemDesignStub';
import { computeRubricScore, getRubricSuggestions } from '../lib/systemDesignRubric';
import { useAppStore, getSystemDesignProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';
import { SystemDesignProgress } from '../types/progress';

const tabs = [
  { id: 'prompt', label: 'Prompt' },
  { id: 'plan', label: 'Plan' },
  { id: 'practice', label: 'Practice' },
  { id: 'review', label: 'Review' }
];

const mermaidSkeleton = `flowchart LR
  Client --> API
  API --> Service
  Service --> DB
`;

const SystemDesignDetail = () => {
  const { id } = useParams();
  const prompts = useSystemDesignPrompts();
  const prompt = prompts.find((item) => item.id === id);
  const progress = useAppStore((state) => state.progress);
  const updateProgress = useAppStore((state) => state.updateSystemDesignProgress);
  const setStepStatus = useAppStore((state) => state.setSystemDesignStepStatus);
  const setRubricCheck = useAppStore((state) => state.setSystemDesignRubricCheck);
  const saveExplanation = useAppStore((state) => state.saveSystemDesignExplanation);

  const [activeTab, setActiveTab] = useState('prompt');
  const [content, setContent] = useState('');
  const [mermaidText, setMermaidText] = useState('');
  const [completion, setCompletion] = useState<Record<number, 'not_started' | 'in_progress' | 'completed'>>({});
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [tradeoff, setTradeoff] = useState('');
  const [risk, setRisk] = useState('');
  const [scaleChange, setScaleChange] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [forceComplete, setForceComplete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const steps = useMemo(() => (prompt ? parseDesignSteps(prompt.guidedDesignStubMarkdown) : []), [prompt]);
  const promptProgress = prompt ? getSystemDesignProgress(progress, prompt.id) : undefined;

  useEffect(() => {
    if (!prompt) return;
    const saved = localStorage.getItem(`dsa-gym-sd-${prompt.id}`);
    setContent(saved ?? prompt.guidedDesignStubMarkdown);
    const savedMermaid = localStorage.getItem(`dsa-gym-sd-mermaid-${prompt.id}`);
    setMermaidText(savedMermaid ?? '');
    if (promptProgress?.explanation) {
      setTradeoff(promptProgress.explanation.tradeoff);
      setRisk(promptProgress.explanation.risk);
      setScaleChange(promptProgress.explanation.scaleChange);
    } else {
      setTradeoff('');
      setRisk('');
      setScaleChange('');
    }
  }, [prompt, promptProgress?.explanation]);

  useEffect(() => {
    if (!prompt) return;
    const nextCompletion = computeDesignStepStatus(content, prompt.guidedDesignStubMarkdown);
    setCompletion(nextCompletion);
    const timer = window.setTimeout(() => {
      Object.entries(nextCompletion).forEach(([stepIndex, status]) => {
        setStepStatus(prompt.id, Number(stepIndex), status);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [content, prompt, setStepStatus]);

  if (!prompt || !promptProgress) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Prompt not found.</p>
        <Link className="text-sm text-ember-400" to="/system-design/catalog">
          Back to catalog
        </Link>
      </div>
    );
  }

  const rubricSuggestions = getRubricSuggestions(prompt.rubric, `${content}\n${mermaidText}`);
  const rubricScore = computeRubricScore(prompt.rubric, promptProgress.rubricChecks);
  const activeStep = steps.find((step) => completion[step.index] !== 'completed')?.index ?? steps[0]?.index ?? 1;
  const allInProgress = steps.every((step) => completion[step.index] && completion[step.index] !== 'not_started');
  const categoriesOk = prompt.rubric.categories.every((category) =>
    category.items.some((item) => promptProgress.rubricChecks[item.id])
  );
  const canComplete = (allInProgress || forceComplete) && categoriesOk;
  const isDueForReview =
    Boolean(promptProgress.nextReviewAt) && new Date(promptProgress.nextReviewAt as string) <= new Date();

  const handleSave = () => {
    updateProgress(prompt.id, {
      attempts: promptProgress.attempts + 1,
      lastAttemptedAt: new Date().toISOString()
    });
  };

  const handleComplete = () => {
    if (!canComplete) return;
    const base: SystemDesignProgress = {
      ...promptProgress,
      passes: promptProgress.passes + 1,
      lastCompletedAt: new Date().toISOString()
    };
    const updated = updateScheduleGeneric(base, 3, 3);
    updateProgress(prompt.id, updated);
    setShowExplainModal(true);
    setActiveTab('review');
  };

  const onSelectStep = (stepIndex: number) => {
    if (!textareaRef.current) return;
    const pos = getStepIndexPosition(content, stepIndex);
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos);
  };

  const submitExplanation = () => {
    saveExplanation(prompt.id, {
      tradeoff: tradeoff.trim(),
      risk: risk.trim(),
      scaleChange: scaleChange.trim()
    });
    setShowExplainModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{prompt.difficulty}</p>
          <h1 className="font-display text-2xl font-semibold">{prompt.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200"
            onClick={() => setForceComplete((prev) => !prev)}
          >
            {forceComplete ? 'Completion override on' : 'Mark complete'}
          </button>
          <button
            className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950"
            onClick={handleComplete}
            disabled={!canComplete}
          >
            Complete session
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'prompt' && (
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass rounded-2xl p-6">
            <ReactMarkdown className="text-sm text-mist-200 space-y-4">{prompt.promptMarkdown}</ReactMarkdown>
            <div className="mt-6">
              <h3 className="font-display text-lg">Requirements</h3>
              <div className="mt-3 text-sm text-mist-200">
                <p className="font-semibold">Functional</p>
                <ul className="mt-2 space-y-1">
                  {prompt.requirements.functional.map((req) => (
                    <li key={req}>• {req}</li>
                  ))}
                </ul>
                <p className="mt-4 font-semibold">Non-functional</p>
                <ul className="mt-2 space-y-1">
                  {prompt.requirements.nonFunctional.map((req) => (
                    <li key={req}>• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Scale & constraints</h3>
            <p className="mt-3 text-sm text-mist-200">Traffic: {prompt.scale.traffic}</p>
            <p className="text-sm text-mist-200">Storage: {prompt.scale.storage}</p>
            <p className="text-sm text-mist-200">Retention: {prompt.scale.retention}</p>
            <ul className="mt-4 space-y-2 text-sm text-mist-200">
              {prompt.constraints.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'plan' && (
        <section className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Reference overview</h3>
          <ReactMarkdown className="mt-3 text-sm text-mist-200 space-y-4">
            {prompt.reference.overviewMarkdown}
          </ReactMarkdown>
          <div className="mt-6">
            <h3 className="font-display text-lg">Key decisions</h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-200">
              {prompt.reference.keyDecisions.map((decision) => (
                <li key={decision.decision}>
                  <strong>{decision.decision}</strong>: {decision.why}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'practice' && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {isDueForReview && promptProgress.explanation && (
              <div className="rounded-2xl border border-ember-500/30 bg-ember-500/10 p-4 text-sm text-mist-200">
                <p className="font-semibold text-ember-300">Due for review: last explanation</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mist-300">Tradeoff</p>
                <p>{promptProgress.explanation.tradeoff}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist-300">Risk + mitigation</p>
                <p>{promptProgress.explanation.risk}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-mist-300">10x scale change</p>
                <p>{promptProgress.explanation.scaleChange}</p>
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="h-[520px] w-full rounded-2xl border border-white/10 bg-transparent p-3 text-xs font-mono"
              value={content}
              onChange={(event) => {
                const next = event.target.value;
                setContent(next);
                localStorage.setItem(`dsa-gym-sd-${prompt.id}`, next);
              }}
            />
            <div className="flex gap-2">
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                onClick={handleSave}
              >
                Save progress
              </button>
            </div>
            <MermaidEditor
              value={mermaidText}
              onChange={(value) => {
                setMermaidText(value);
                localStorage.setItem(`dsa-gym-sd-mermaid-${prompt.id}`, value);
              }}
              onInsertSkeleton={() => setMermaidText(mermaidSkeleton)}
            />
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <p className="text-xs text-mist-300">Active step: {activeStep}</p>
              <div className="mt-4">
                <StepList steps={steps} completion={completion} activeStep={activeStep} onSelect={onSelectStep} />
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Rubric</h3>
              <SystemDesignRubric
                rubric={prompt.rubric}
                checked={promptProgress.rubricChecks}
                suggestions={rubricSuggestions}
                scores={rubricScore}
                onToggle={setRubricCheck.bind(null, prompt.id)}
              />
            </div>
          </div>
        </section>
      )}

      {activeTab === 'review' && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Recall prompts</h3>
            <ul className="mt-4 space-y-2 text-sm text-mist-200">
              {prompt.recallQuestions.map((question) => (
                <li key={question}>• {question}</li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-lg">Common pitfalls</h3>
            <ul className="mt-4 space-y-2 text-sm text-mist-200">
              {prompt.commonPitfalls.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Explain it back</h3>
            <p className="mt-2 text-sm text-mist-200">Review and update your explanation after re-solving.</p>
            {promptProgress.explanationHistory && promptProgress.explanationHistory.length > 0 && (
              <div className="mt-4">
                <button
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                  onClick={() => setShowCompare((prev) => !prev)}
                >
                  {showCompare ? 'Hide' : 'Compare my last explanation'}
                </button>
                {showCompare && (
                  <div className="mt-4 space-y-4 text-sm text-mist-200">
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Previous</p>
                      <p className="mt-2">{promptProgress.explanationHistory?.slice(-1)[0]?.tradeoff}</p>
                      <p className="mt-2">{promptProgress.explanationHistory?.slice(-1)[0]?.risk}</p>
                      <p className="mt-2">{promptProgress.explanationHistory?.slice(-1)[0]?.scaleChange}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Current</p>
                      <p className="mt-2">{promptProgress.explanation?.tradeoff}</p>
                      <p className="mt-2">{promptProgress.explanation?.risk}</p>
                      <p className="mt-2">{promptProgress.explanation?.scaleChange}</p>
                    </div>
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
            <h3 className="font-display text-xl font-semibold">Explain it back (system design)</h3>
            <p className="mt-2 text-sm text-mist-200">
              Capture your primary tradeoff, biggest risk, and how you would evolve at 10x scale.
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">
                Primary tradeoff and why
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={tradeoff}
                  onChange={(event) => setTradeoff(event.target.value)}
                />
              </label>
              <label className="block">
                Biggest risk + mitigation
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={risk}
                  onChange={(event) => setRisk(event.target.value)}
                />
              </label>
              <label className="block">
                One change at 10x scale
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={scaleChange}
                  onChange={(event) => setScaleChange(event.target.value)}
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
                disabled={!tradeoff.trim() || !risk.trim() || !scaleChange.trim()}
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

export default SystemDesignDetail;
