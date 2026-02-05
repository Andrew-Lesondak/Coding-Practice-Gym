import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Settings = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">Settings</h1>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
          >
            Back
          </button>
        </div>
        <p className="mt-2 text-sm text-mist-200">Customize hint levels, step locking, and language mode.</p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Language mode</label>
          <div className="mt-3 flex gap-3">
            {['ts', 'js'].map((mode) => (
              <button
                key={mode}
                onClick={() => updateSettings({ languageMode: mode as 'ts' | 'js' })}
                className={`rounded-full border px-4 py-2 text-sm ${
                  settings.languageMode === mode
                    ? 'border-ember-500/60 bg-ember-500/10 text-ember-300'
                    : 'border-white/10 text-mist-200'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Hint level</label>
          <input
            type="range"
            min={0}
            max={3}
            value={settings.hintLevel}
            onChange={(event) => updateSettings({ hintLevel: Number(event.target.value) as 0 | 1 | 2 | 3 })}
            className="mt-2 w-full"
          />
          <p className="text-xs text-mist-300">0 = only step names, 3 = reveal full hints.</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Lock steps</p>
            <p className="text-sm text-mist-200">Prevent editing later steps until earlier ones are completed.</p>
          </div>
          <button
            onClick={() => updateSettings({ lockSteps: !settings.lockSteps })}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              settings.lockSteps ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-mist-200'
            }`}
          >
            {settings.lockSteps ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Reset progress</h2>
        <p className="mt-2 text-sm text-mist-200">
          To fully reset progress, clear your browser local storage for DSA Gym.
        </p>
      </section>
    </div>
  );
};

export default Settings;
