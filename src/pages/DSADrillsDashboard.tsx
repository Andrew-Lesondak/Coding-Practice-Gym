import { Link } from 'react-router-dom';
import { dsaDrills } from '../data/dsaDrills';

const DSADrillsDashboard = () => {
  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">DSA Speed Drills</h1>
        <p className="mt-2 text-sm text-mist-200">Short, focused drills to build recall and speed.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {dsaDrills.map((drill) => (
          <Link key={drill.id} to={`/dsa/drills/${drill.id}`} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold">{drill.id}</p>
                <p className="text-xs text-mist-300">{drill.drillType} • {drill.difficulty}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist-200">
                {drill.timeLimitMinutes} min
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default DSADrillsDashboard;
