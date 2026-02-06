import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import StepList from '../components/StepList';
import SystemDesignRubric from '../components/SystemDesignRubric';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { useSystemDesignDrills } from '../lib/useSystemDesignDrills';
import { computeDesignStepStatus, parseDesignSteps } from '../lib/systemDesignStub';
import { computeRubricScore, getRubricSuggestions } from '../lib/systemDesignRubric';
import { getRubricSubset } from '../lib/systemDesignDrillRubric';
import { phases, advancePhase } from '../lib/mockInterview';
import { getMockSession, saveMockSession } from '../lib/mockInterviewStorage';

const SystemDesignMockSession = () => {
  const { sessionId } = useParams();
  const prompts = useSystemDesignPrompts();
  const drills = useSystemDesignDrills();
  const [session, setSession] = useState(() => (sessionId ? getMockSession(sessionId) : null));
  const [content, setContent] = useState('');
  const [completion, setCompletion] = useState<Record<number, 'not_started' | 'in_progress' | 'completed'>>({});
  const [started, setStarted] = useState(false);
  const [wentWell, setWentWell] = useState('');
  const [change, setChange] = useState('');
  const [weakest, setWeakest] = useState('');
  const [confidence, setConfidence] = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    setSession(getMockSession(sessionId));
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const phase = phases[session.phaseIndex];
    if (phase.id === 'full-design') {
      const prompt = prompts.find((p) => p.id === session.promptId);
      setContent(prompt?.guidedDesignStubMarkdown ?? '');
    } else if (phase.id === 'reflection') {
      setContent('');
    } else {
      const drillId =
        phase.id === 'requirements'
          ? session.drills.requirementsDrillId
          : phase.id === 'api-data'
          ? session.drills.apiDrillId
          : session.drills.scalingDrillId;
      const drill = drills.find((d) => d.id === drillId);
      setContent(drill?.starterTemplateMarkdown ?? '');
    }
  }, [session, drills, prompts]);

  useEffect(() => {
    if (!session || !started) return;
    const timer = window.setInterval(() => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, phaseTimeRemainingSeconds: prev.phaseTimeRemainingSeconds - 1 };
        if (next.phaseTimeRemainingSeconds <= 0) {
          next.phaseTimeRemainingSeconds = 0;
        }
        saveMockSession(next);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session, started]);

  useEffect(() => {
    if (!session) return;
    if (session.phaseTimeRemainingSeconds === 0 && started) {
      handleEndPhase();
    }
  }, [session?.phaseTimeRemainingSeconds]);

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Session not found.</p>
        <Link className="text-sm text-ember-400" to="/system-design/mock">
          Back
        </Link>
      </div>
    );
  }

  const phase = phases[session.phaseIndex];
  const prompt = prompts.find((p) => p.id === session.promptId);
  const drillId =
    phase.id === 'requirements'
      ? session.drills.requirementsDrillId
      : phase.id === 'api-data'
      ? session.drills.apiDrillId
      : phase.id === 'scaling-reliability'
      ? session.drills.scalingDrillId
      : null;
  const drill = drills.find((d) => d.id === drillId);

  const rubricBase = prompt?.rubric ?? { categories: [] };
  const rubricSubset = drill ? getRubricSubset(rubricBase, drill.rubricSubset) : rubricBase;
  const rubricChecks =
    (drillId && session.responses.drillResponses[drillId]?.rubricChecks) ||
    session.responses.fullDesignResponse?.rubricChecks ||
    {};
  const rubricScore = computeRubricScore(rubricSubset, rubricChecks);
  const rubricSuggestions = getRubricSuggestions(rubricSubset, content);

  const steps = parseDesignSteps(content);
  const activeStep = steps.find((step) => completion[step.index] !== 'completed')?.index ?? steps[0]?.index ?? 1;

  useEffect(() => {
    if (!content) return;
    const original =
      phase.id === 'full-design'
        ? prompt?.guidedDesignStubMarkdown ?? content
        : drill?.starterTemplateMarkdown ?? content;
    const nextCompletion = computeDesignStepStatus(content, original);
    setCompletion(nextCompletion);
  }, [content, phase.id, drill?.starterTemplateMarkdown, prompt?.guidedDesignStubMarkdown]);

  const handleStart = () => {
    if (started) return;
    setStarted(true);
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, phaseStartedAt: Date.now() };
      saveMockSession(next);
      return next;
    });
  };

  const handleEndPhase = () => {
    setStarted(false);
    const now = Date.now();
    const nextSession = { ...session };
    const usedSeconds = phases[session.phaseIndex].seconds - session.phaseTimeRemainingSeconds;
    nextSession.phaseDurations = { ...(nextSession.phaseDurations ?? {}), [phase.id]: usedSeconds };
    if (phase.id === 'full-design') {
      nextSession.responses.fullDesignResponse = {
        content,
        rubricChecks,
        completedAt: now
      };
      nextSession.scores.fullDesignScore = rubricScore.overall;
    } else if (drillId) {
      nextSession.responses.drillResponses[drillId] = {
        content,
        rubricChecks,
        completedAt: now
      };
      nextSession.scores.drillScores[drillId] = rubricScore.overall;
    } else if (phase.id === 'reflection') {
      nextSession.confidenceRating = confidence;
      nextSession.reflection = { wentWell, change, weakestPhase: weakest };
      nextSession.completedAt = now;
    }
    const advanced = advancePhase(nextSession);
    saveMockSession(advanced);
    setSession(advanced);
  };

  const timeLabel = `${Math.floor(session.phaseTimeRemainingSeconds / 60)}:${String(
    session.phaseTimeRemainingSeconds % 60
  ).padStart(2, '0')}`;

  const renderReview = () => {
    return (
      <section className="space-y-6">
        <h2 className="font-display text-xl font-semibold">Mock Interview Review</h2>
        <div className="rounded-2xl border border-white/10 p-4 text-sm text-mist-200">
          <p className="font-semibold">Timeline</p>
          <ul className="mt-2 space-y-1">
            {phases.map((p, idx) => (
              <li key={p.id}>
                {idx + 1}. {p.label} — {Math.round(p.seconds / 60)} min — Score: {idx < 3 && drillId
                  ? Math.round((session.scores.drillScores[drillId] ?? 0) * 100)
                  : idx === 3
                  ? Math.round(session.scores.fullDesignScore * 100)
                  : '-'}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 p-4 text-sm text-mist-200">
          <p className="font-semibold">Reference comparison</p>
          <p className="mt-2">See full design vs reference in System Design prompt review.</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-4 text-sm text-mist-200">
          <p className="font-semibold">Reflection</p>
          <p className="mt-2">{session.reflection?.wentWell}</p>
        </div>
      </section>
    );
  };

  if (session.completedAt) {
    return renderReview();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Mock Interview</p>
          <h1 className="font-display text-2xl font-semibold">{prompt?.title}</h1>
          <p className="text-xs text-mist-300">Phase {session.phaseIndex + 1}: {phase.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Time remaining</p>
          <p className="text-xl font-semibold">{timeLabel}</p>
        </div>
      </div>

      {phase.id === 'reflection' ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          <label className="text-sm">
            What went well?
            <textarea className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={wentWell} onChange={(e) => setWentWell(e.target.value)} />
          </label>
          <label className="text-sm">
            What would you change?
            <textarea className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={change} onChange={(e) => setChange(e.target.value)} />
          </label>
          <label className="text-sm">
            Weakest phase
            <input className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={weakest} onChange={(e) => setWeakest(e.target.value)} />
          </label>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Confidence (1-5)</label>
            <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="mt-2 w-full" />
          </div>
          <button className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" onClick={handleEndPhase}>
            Finish interview
          </button>
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <ReactMarkdown className="text-sm text-mist-200 space-y-3">
                {phase.id === 'full-design' ? prompt?.promptMarkdown ?? '' : drill?.promptMarkdown ?? ''}
              </ReactMarkdown>
            </div>
            <textarea
              ref={textareaRef}
              className="h-[420px] w-full rounded-2xl border border-white/10 bg-transparent p-3 text-xs font-mono"
              value={content}
              onChange={(event) => {
                if (!started) handleStart();
                if (session.phaseTimeRemainingSeconds === 0) return;
                const next = event.target.value;
                setContent(next);
              }}
              readOnly={session.phaseTimeRemainingSeconds === 0}
            />
            <div className="flex gap-2">
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={handleStart}>
                Start phase
              </button>
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" onClick={handleEndPhase}>
                End phase early
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Steps</h3>
              <StepList steps={steps} completion={completion} activeStep={activeStep} />
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg">Rubric</h3>
              <SystemDesignRubric
                rubric={rubricSubset}
                checked={rubricChecks}
                suggestions={rubricSuggestions}
                scores={rubricScore}
                onToggle={(itemId, checked) => {
                  const responses = session.responses;
                  if (drillId) {
                    const current = responses.drillResponses[drillId] ?? { content: '', rubricChecks: {} };
                    responses.drillResponses[drillId] = { ...current, rubricChecks: { ...current.rubricChecks, [itemId]: checked } };
                  } else {
                    responses.fullDesignResponse = {
                      content: responses.fullDesignResponse?.content ?? '',
                      rubricChecks: { ...(responses.fullDesignResponse?.rubricChecks ?? {}), [itemId]: checked }
                    };
                  }
                  const next = { ...session, responses };
                  saveMockSession(next);
                  setSession(next);
                }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SystemDesignMockSession;
