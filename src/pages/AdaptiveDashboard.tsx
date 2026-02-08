import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { AdaptiveSessionPlan, AdaptiveBlock } from '../types/adaptive';
import { generateAdaptivePlan, getReplacementCandidates } from '../lib/adaptivePlanner';
import { saveAdaptivePlan } from '../lib/adaptiveStorage';
import { problems } from '../data/problems';
import { dsaDrills } from '../data/dsaDrills';
import { systemDesignPrompts } from '../data/systemDesignPrompts';
import { systemDesignDrills } from '../data/systemDesignDrills';
import { reactCodingProblems } from '../data/reactCodingProblems';

const titleForTarget = (blockType: AdaptiveBlock['blockType'], targetId: string) => {
  if (blockType.startsWith('dsa')) {
    const drill = dsaDrills.find((d) => d.id === targetId);
    const problem = problems.find((p) => p.id === targetId);
    return drill?.id ?? problem?.title ?? targetId;
  }
  if (blockType === 'react_problem') {
    return reactCodingProblems.find((p) => p.id === targetId)?.title ?? targetId;
  }
  const drill = systemDesignDrills.find((d) => d.id === targetId);
  const prompt = systemDesignPrompts.find((p) => p.id === targetId);
  return drill?.title ?? prompt?.title ?? targetId;
};

const AdaptiveDashboard = () => {
  const progress = useAppStore((state) => state.progress);
  const navigate = useNavigate();
  const [mode, setMode] = useState<AdaptiveSessionPlan['mode']>('mixed');
  const [lengthMinutes, setLengthMinutes] = useState(30);
  const [intensity, setIntensity] = useState<AdaptiveSessionPlan['intensity']>('interview');
  const [seed, setSeed] = useState(1);
  const [plan, setPlan] = useState<AdaptiveSessionPlan | null>(null);

  const totalMinutes = plan?.blocks.reduce((sum, block) => sum + block.minutes, 0) ?? 0;

  const generate = () => {
    const next = generateAdaptivePlan({
      mode,
      lengthMinutes,
      intensity,
      seed,
      progress
    });
    setPlan(next);
    saveAdaptivePlan(next);
  };

  const updateBlock = (index: number, patch: Partial<AdaptiveBlock>) => {
    if (!plan) return;
    const blocks = plan.blocks.map((block, idx) => (idx === index ? { ...block, ...patch } : block));
    const next = { ...plan, blocks };
    setPlan(next);
    saveAdaptivePlan(next);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    if (!plan) return;
    const nextBlocks = [...plan.blocks];
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= nextBlocks.length - 1) return;
    [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
    const next = { ...plan, blocks: nextBlocks };
    setPlan(next);
    saveAdaptivePlan(next);
  };

  const removeBlock = (index: number) => {
    if (!plan) return;
    const nextBlocks = plan.blocks.filter((_, idx) => idx !== index);
    const next = { ...plan, blocks: nextBlocks };
    setPlan(next);
    saveAdaptivePlan(next);
  };

  const onRun = () => {
    if (!plan) return;
    saveAdaptivePlan(plan);
    navigate(`/adaptive/session/${plan.id}`);
  };

  const validationMessage = useMemo(() => {
    if (!plan) return null;
    if (Math.abs(totalMinutes - lengthMinutes) > 2) {
      return `Total time is ${totalMinutes} minutes. Adjust blocks to be within +/-2 minutes.`;
    }
    const reflectionCount = plan.blocks.filter((block) => block.blockType === 'reflection').length;
    if (reflectionCount !== 1 || plan.blocks[plan.blocks.length - 1].blockType !== 'reflection') {
      return 'Plan must include exactly one reflection block at the end.';
    }
    return null;
  }, [plan, totalMinutes, lengthMinutes]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Adaptive Interview Paths</p>
        <h1 className="font-display text-2xl font-semibold">Session Planner</h1>
      </div>

      <section className="glass rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm">Mode
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={mode} onChange={(e) => setMode(e.target.value as AdaptiveSessionPlan['mode'])}>
              <option value="dsa">DSA</option>
              <option value="system-design">System Design</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="text-sm">Session length
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={lengthMinutes} onChange={(e) => setLengthMinutes(Number(e.target.value))}>
              {[15, 30, 45, 60].map((min) => (
                <option key={min} value={min}>{min} minutes</option>
              ))}
            </select>
          </label>
          <label className="text-sm">Intensity
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2" value={intensity} onChange={(e) => setIntensity(e.target.value as AdaptiveSessionPlan['intensity'])}>
              <option value="chill">Chill</option>
              <option value="interview">Interview</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={generate}>
            Generate plan
          </button>
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={() => setSeed((prev) => prev + 1)}>
            New seed
          </button>
          <span className="text-xs text-mist-300">Seed: {seed}</span>
        </div>
      </section>

      {plan ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Plan Preview</h2>
            <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200" onClick={onRun} disabled={Boolean(validationMessage)}>
              Run session
            </button>
          </div>
          {validationMessage && <p className="text-sm text-rose-300">{validationMessage}</p>}
          <div className="space-y-3">
            {plan.blocks.map((block, index) => {
              const replacements = getReplacementCandidates(block.blockType, progress, block.signals.weaknessTag);
              return (
                <div key={block.id} className="glass rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{block.blockType}</p>
                      <p className="font-display text-lg">{block.title}</p>
                      <p className="text-sm text-mist-200">{block.minutes} min {block.timed ? '• Timed' : '• Untimed'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {block.userEditable && (
                        <>
                          <button className="rounded-full border border-white/20 px-3 py-1 text-xs text-mist-200" onClick={() => moveBlock(index, -1)}>
                            Up
                          </button>
                          <button className="rounded-full border border-white/20 px-3 py-1 text-xs text-mist-200" onClick={() => moveBlock(index, 1)}>
                            Down
                          </button>
                          <button className="rounded-full border border-white/20 px-3 py-1 text-xs text-mist-200" onClick={() => removeBlock(index)}>
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-mist-300">{block.rationale}</p>
                  {block.userEditable && replacements.length > 0 && (
                    <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-mist-400">
                      Replace
                      <select
                        className="mt-2 w-full rounded-xl border border-white/10 bg-transparent p-2 text-sm"
                        value={block.targetId}
                        onChange={(e) =>
                          updateBlock(index, {
                            targetId: e.target.value,
                            title: titleForTarget(block.blockType, e.target.value),
                            rationale: `User-selected replacement to keep focus on ${block.signals.weaknessTag ?? 'coverage'}.`
                          })
                        }
                      >
                        {replacements.map((candidate) => (
                          <option key={candidate.targetId} value={candidate.targetId}>
                            {titleForTarget(block.blockType, candidate.targetId)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="glass rounded-2xl p-6 text-sm text-mist-300">
          Generate a plan to preview your adaptive session blocks.
        </div>
      )}

      <div className="text-sm text-mist-300">
        <Link className="text-ember-400" to="/">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default AdaptiveDashboard;
