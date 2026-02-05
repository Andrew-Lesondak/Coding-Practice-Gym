import { Link } from 'react-router-dom';
import { useSystemDesignDrills } from '../lib/useSystemDesignDrills';
import { useAppStore, getSystemDesignDrillProgress } from '../store/useAppStore';

const SystemDesignDrillsDashboard = () => {
  const drills = useSystemDesignDrills();
  const progress = useAppStore((state) => state.progress);

  const due = drills.filter((drill) => {
    const p = getSystemDesignDrillProgress(progress, drill.id);
    if (!p.nextReviewAt) return false;
    return new Date(p.nextReviewAt) <= new Date();
  });

  const averageByType: Record<string, number> = {};
  const counts: Record<string, number> = {};
  drills.forEach((drill) => {
    const p = getSystemDesignDrillProgress(progress, drill.id);
    if (p.lastScore !== undefined) {
      averageByType[drill.type] = (averageByType[drill.type] ?? 0) + p.lastScore;
      counts[drill.type] = (counts[drill.type] ?? 0) + 1;
    }
  });
  const weakTypes = Object.entries(averageByType)
    .map(([type, total]) => ({ type, avg: total / (counts[type] || 1) }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const redo = weakTypes[0]?.type
    ? drills.find((drill) => drill.type === weakTypes[0].type)
    : drills[0];

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6">
        <h1 className="font-display text-2xl font-semibold">System Design Drills</h1>
        <p className="mt-2 text-sm text-mist-200">Fast, focused practice on key interview sub-skills.</p>
        <div className="mt-4 flex gap-2">
          {redo && (
            <Link
              to={`/system-design/drills/${redo.id}`}
              className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950"
            >
              Redo similar drill
            </Link>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Due for review</h2>
          <span className="text-xs text-mist-300">{due.length} due</span>
        </div>
        {due.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-sm text-mist-300">No drills due.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {due.map((drill) => (
              <Link key={drill.id} to={`/system-design/drills/${drill.id}`} className="glass rounded-2xl p-5">
                <p className="font-display text-lg font-semibold">{drill.title}</p>
                <p className="text-xs text-mist-300">{drill.type} • {drill.difficulty}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Weak drill types</h2>
        {weakTypes.length === 0 ? (
          <p className="text-sm text-mist-300">Complete a few drills to see averages.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {weakTypes.map((item) => (
              <div key={item.type} className="glass rounded-2xl p-5">
                <p className="text-sm font-semibold">{item.type}</p>
                <p className="text-xs text-mist-300">Avg score: {Math.round(item.avg * 100)}%</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SystemDesignDrillsDashboard;
