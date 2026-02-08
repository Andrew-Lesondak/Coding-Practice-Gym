import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuizQuestions } from '../lib/useQuizQuestions';
import { useAppStore } from '../store/useAppStore';
import { QuizQuestion } from '../types/quiz';
import { getQuizTypeLabel } from '../lib/quizEngine';

const QuizCatalog = () => {
  const questions = useQuizQuestions();
  const progress = useAppStore((state) => state.progress.quizzes);
  const [topic, setTopic] = useState<QuizQuestion['topic'] | 'all'>('all');
  const [difficulty, setDifficulty] = useState<'all' | QuizQuestion['difficulty']>('all');
  const [type, setType] = useState<'all' | QuizQuestion['type']>('all');
  const [status, setStatus] = useState<'all' | 'new' | 'due' | 'mastered'>('all');

  const now = Date.now();
  const filtered = useMemo(() => {
    return questions.filter((question) => {
      if (topic !== 'all' && question.topic !== topic) return false;
      if (difficulty !== 'all' && question.difficulty !== difficulty) return false;
      if (type !== 'all' && question.type !== type) return false;
      const p = progress[question.id];
      const accuracy = p && p.attempts ? p.correctCount / p.attempts : 0;
      const due = p?.nextReviewAt ? new Date(p.nextReviewAt).getTime() <= now : false;
      const mastered = p ? p.correctCount >= 3 && accuracy >= 0.8 : false;
      if (status === 'new' && p) return false;
      if (status === 'due' && !due) return false;
      if (status === 'mastered' && !mastered) return false;
      return true;
    });
  }, [questions, progress, topic, difficulty, type, status, now]);

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Quiz Catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Browse the question bank and filter by topic.</p>
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="grid gap-3 text-xs text-mist-200 md:grid-cols-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Topic</label>
            <select
              aria-label="Topic"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Difficulty</label>
            <select
              aria-label="Difficulty"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Type</label>
            <select
              aria-label="Type"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="true_false">True/False</option>
              <option value="single_choice">Single choice</option>
              <option value="multiple_choice">Multiple choice</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Status</label>
            <select
              aria-label="Status"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="due">Due</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((question) => (
          <div key={question.id} className="glass rounded-2xl p-4 text-sm text-mist-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-mist-400">{question.subtopic}</p>
                <p className="mt-1 font-semibold text-mist-100">{question.promptMarkdown}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-mist-300">
                <span className="rounded-full border border-white/10 px-2 py-1">{question.topic}</span>
                <span className="rounded-full border border-white/10 px-2 py-1">{question.difficulty}</span>
                <span className="rounded-full border border-white/10 px-2 py-1">{getQuizTypeLabel(question.type)}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-mist-300">No questions match filters.</div>
        )}
      </section>

      <Link className="text-sm text-ember-300" to="/quizzes">
        Back to quizzes
      </Link>
    </div>
  );
};

export default QuizCatalog;
