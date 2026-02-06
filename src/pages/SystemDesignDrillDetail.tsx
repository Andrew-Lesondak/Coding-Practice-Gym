import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import StepList from '../components/StepList';
import SystemDesignRubric from '../components/SystemDesignRubric';
import { useSystemDesignDrills } from '../lib/useSystemDesignDrills';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { computeDesignStepStatus, insertIntoTemplateRegion, parseDesignSteps } from '../lib/systemDesignStub';
import { computeRubricScore, getRubricSuggestions } from '../lib/systemDesignRubric';
import { getRubricSubset } from '../lib/systemDesignDrillRubric';
import { useAppStore, getSystemDesignDrillProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';

const SystemDesignDrillDetail = () => {
  const { id } = useParams();
  const drills = useSystemDesignDrills();
  const prompts = useSystemDesignPrompts();
  const drill = drills.find((item) => item.id === id);
  const relatedPrompt = prompts.find((item) => item.id === drill?.relatedPromptId);

  const progress = useAppStore((state) => state.progress);
  const updateProgress = useAppStore((state) => state.updateSystemDesignDrillProgress);
  const setStepStatus = useAppStore((state) => state.setSystemDesignDrillStepStatus);
  const setRubricCheck = useAppStore((state) => state.setSystemDesignDrillRubricCheck);
  const saveExplanation = useAppStore((state) => state.saveSystemDesignDrillExplanation);

  const [content, setContent] = useState('');
  const [completion, setCompletion] = useState<Record<number, 'not_started' | 'in_progress' | 'completed'>>({});
  const [remaining, setRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [decision, setDecision] = useState('');
  const [risk, setRisk] = useState('');
  const [confidence, setConfidence] = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const drillProgress = drill ? getSystemDesignDrillProgress(progress, drill.id) : undefined;

  useEffect(() => {
    if (!drill) return;
    const saved = localStorage.getItem(`dsa-gym-drill-${drill.id}`);
    setContent(saved ?? drill.starterTemplateMarkdown);
    setRemaining(drill.timeLimitMinutes * 60);
  }, [drill]);

  useEffect(() => {
    if (!drill || !started || ended) return;
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
  }, [drill, started, ended]);

  useEffect(() => {
    if (!drill) return;
    const nextCompletion = computeDesignStepStatus(content, drill.starterTemplateMarkdown);
    setCompletion(nextCompletion);
    const timer = window.setTimeout(() => {
      Object.entries(nextCompletion).forEach(([stepIndex, status]) => {
        setStepStatus(drill.id, Number(stepIndex), status);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [content, drill, setStepStatus]);

  if (!drill || !drillProgress) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Drill not found.</p>
        <Link className="text-sm text-ember-400" to="/system-design/drills">
          Back to drills
        </Link>
      </div>
    );
  }

  const steps = parseDesignSteps(drill.starterTemplateMarkdown).filter((step) => drill.stepsIncluded.includes(step.index));
  const activeStep = steps.find((step) => completion[step.index] !== 'completed')?.index ?? steps[0]?.index ?? 1;

  const rubricBase = relatedPrompt?.rubric ?? { categories: [] };
  const rubricSubset = getRubricSubset(rubricBase, drill.rubricSubset);
  const rubricScore = computeRubricScore(rubricSubset, drillProgress.rubricChecks);
  const rubricSuggestions = getRubricSuggestions(rubricSubset, content);

  const startDrill = () => {
    if (started) return;
    setStarted(true);
  };

  const endDrill = () => {
    setEnded(true);
  };

  const finalizeDrill = () => {
    const updated = updateScheduleGeneric(
      {
        ...drillProgress,
        attempts: drillProgress.attempts + 1,
        lastAttemptedAt: new Date().toISOString(),
        lastScore: rubricScore.overall,
        confidence
      },
      3,
      confidence
    );
    updateProgress(drill.id, updated);
  };

  useEffect(() => {
    if (ended) {
      finalizeDrill();
    }
  }, [ended]);

  const timeLabel = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  const onSelectStep = (stepIndex: number) => {
    if (!textareaRef.current) return;
    const inserted = insertIntoTemplateRegion(content, stepIndex, '');
    setContent(inserted);
    localStorage.setItem(`dsa-gym-drill-${drill.id}`, inserted);
    textareaRef.current.focus();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{drill.type}</p>
          <h1 className="font-display text-2xl font-semibold">{drill.title}</h1>
          <p className="text-xs text-mist-300">Difficulty: {drill.difficulty}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Time remaining</p>
          <p className="text-xl font-semibold">{timeLabel}</p>
        </div>
      </div>

      {ended ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Your response</h3>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-mist-200">{content}</pre>
            <div className="mt-4">
              <h3 className="font-display text-lg">Explain back</h3>
              <label className="block text-sm">
                Main decision
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={decision}
                  onChange={(event) => setDecision(event.target.value)}
                />
              </label>
              <label className="mt-4 block text-sm">
                Risk considered
                <textarea
                  className="mt-2 h-20 w-full rounded-xl border border-white/10 bg-transparent p-2"
                  value={risk}
                  onChange={(event) => setRisk(event.target.value)}
                />
              </label>
              <div className="mt-4">
                <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={confidence}
                  onChange={(event) => setConfidence(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <button
                className="mt-4 rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
                onClick={() => saveExplanation(drill.id, { decision, risk })}
                disabled={!decision.trim() || !risk.trim()}
              >
                Save explanation
              </button>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg">Rubric</h3>
            <SystemDesignRubric
              rubric={rubricSubset}
              checked={drillProgress.rubricChecks}
              suggestions={rubricSuggestions}
              scores={rubricScore}
              onToggle={setRubricCheck.bind(null, drill.id)}
            />
            <div className="mt-4">
              <details className="rounded-xl border border-white/10 p-3">
                <summary className="cursor-pointer text-xs text-mist-300">Reference notes</summary>
                <ul className="mt-2 space-y-1 text-xs text-mist-200">
                  {drill.referenceNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <ReactMarkdown className="text-sm text-mist-200 space-y-3">{drill.promptMarkdown}</ReactMarkdown>
            </div>
            <textarea
              ref={textareaRef}
              className="h-[420px] w-full rounded-2xl border border-white/10 bg-transparent p-3 text-xs font-mono"
              value={content}
              onChange={(event) => {
                if (!started) startDrill();
                if (ended) return;
                const next = event.target.value;
                setContent(next);
                localStorage.setItem(`dsa-gym-drill-${drill.id}`, next);
              }}
              readOnly={ended}
            />
            <div className="flex gap-2">
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                onClick={startDrill}
              >
                Start drill
              </button>
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
                onClick={endDrill}
              >
                End early
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <StepList steps={steps} completion={completion} activeStep={activeStep} onSelect={onSelectStep} />
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Rubric</h3>
              <SystemDesignRubric
                rubric={rubricSubset}
                checked={drillProgress.rubricChecks}
                suggestions={rubricSuggestions}
                scores={rubricScore}
                onToggle={setRubricCheck.bind(null, drill.id)}
              />
            </div>
            <div className="glass rounded-2xl p-5">
              <details>
                <summary className="cursor-pointer text-xs text-mist-300">Reference notes</summary>
                <ul className="mt-2 space-y-1 text-xs text-mist-200">
                  {drill.referenceNotes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SystemDesignDrillDetail;
