import { Link, useNavigate } from 'react-router-dom';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { useSystemDesignDrills } from '../lib/useSystemDesignDrills';
import { createMockSession } from '../lib/mockInterview';
import { saveMockSession } from '../lib/mockInterviewStorage';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const SystemDesignMockDashboard = () => {
  const prompts = useSystemDesignPrompts();
  const drills = useSystemDesignDrills();
  const [promptId, setPromptId] = useState(prompts[0]?.id ?? '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const sessions = useAppStore((state) => state.mockSessions);
  const last = sessions.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
  const navigate = useNavigate();

  const startSession = () => {
    const session = createMockSession(promptId, drills, difficulty);
    saveMockSession(session);
    navigate(`/system-design/mock/${session.id}`);
  };

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6">
        <h1 className="font-display text-2xl font-semibold">Mock Interview Mode</h1>
        <p className="mt-2 text-sm text-mist-200">Run a 45-minute structured system design interview.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            Prompt
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
              value={promptId}
              onChange={(e) => setPromptId(e.target.value)}
            >
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Difficulty
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={startSession}
              className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950"
            >
              Start mock interview
            </button>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg">Last mock interview</h2>
        {last ? (
          <div className="mt-3 flex items-center justify-between text-sm text-mist-200">
            <span>{last.promptId}</span>
            <Link className="text-ember-300" to={`/system-design/mock/${last.id}`}>
              Review
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-mist-300">No mock interviews yet.</p>
        )}
      </section>
    </div>
  );
};

export default SystemDesignMockDashboard;
