import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuizQuestions } from '../lib/useQuizQuestions';
import { getQuizSession, saveQuizSession } from '../lib/quizStorage';
import { gradeQuizAnswer } from '../lib/quizEngine';
import QuizQuestionCard from '../components/QuizQuestionCard';
import QuizProgressHeader from '../components/QuizProgressHeader';
import { QuizQuestion } from '../types/quiz';
import { useAppStore, getQuizProgress } from '../store/useAppStore';
import { updateScheduleGeneric } from '../lib/spacedRepetition';

const difficultyToRating: Record<QuizQuestion['difficulty'], number> = {
  easy: 2,
  medium: 3,
  hard: 4
};

const QuizSession = () => {
  const [params] = useSearchParams();
  const sessionId = params.get('id');
  const navigate = useNavigate();
  const questions = useQuizQuestions();
  const updateQuizProgress = useAppStore((state) => state.updateQuizProgress);
  const progress = useAppStore((state) => state.progress);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const session = sessionId ? getQuizSession(sessionId) : null;
  const sessionQuestions = useMemo(() => {
    if (!session) return [];
    return session.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean) as QuizQuestion[];
  }, [session, questions]);

  const current = sessionQuestions[currentIndex];

  useEffect(() => {
    if (!session || !current) return;
    setSelected([]);
    setActiveIndex(0);
    setShowFeedback(false);
    setLastCorrect(null);
    setShowExplanation(false);
    if (session.settings.timed) {
      setTimeLeft(session.settings.secondsPerQuestion);
      startTimeRef.current = Date.now();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
        const next = Math.max(0, session.settings.secondsPerQuestion - elapsed);
        setTimeLeft(next);
      }, 250);
    } else {
      setTimeLeft(undefined);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      startTimeRef.current = Date.now();
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [session, currentIndex, current]);

  useEffect(() => {
    containerRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    if (!session?.settings.timed || timeLeft === undefined) return;
    if (timeLeft > 0) return;
    if (!showFeedback) {
      handleSubmit();
    }
  }, [timeLeft, session?.settings.timed, showFeedback]);

  if (!session || sessionQuestions.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Session not found.</p>
        <button className="text-sm text-ember-300" onClick={() => navigate('/quizzes')}>
          Back to quizzes
        </button>
      </div>
    );
  }

  const total = sessionQuestions.length;
  const answered = Object.keys(session.results).length;
  const correctCount = Object.values(session.results).filter(Boolean).length;
  const streak = Object.values(session.results).reduce((acc, value) => (value ? acc + 1 : 0), 0);

  const handleSubmit = () => {
    if (!current) return;
    if (current.type === 'true_false' && selected.length === 0) {
      return;
    }
    if (current.type !== 'true_false' && selected.length === 0) {
      return;
    }
    const answerValue =
      current.type === 'true_false' ? selected[0] === 'true' : current.type === 'single_choice' ? selected[0] : selected;
    const isCorrect = gradeQuizAnswer(current, answerValue as any);

    const endTime = Date.now();
    const startedAt = startTimeRef.current ?? endTime;
    const elapsedSeconds = Math.max(1, Math.round((endTime - startedAt) / 1000));

    const nextSession = {
      ...session,
      answers: { ...session.answers, [current.id]: answerValue as any },
      results: { ...session.results, [current.id]: isCorrect },
      timePerQuestionSeconds: {
        ...session.timePerQuestionSeconds,
        [current.id]: elapsedSeconds
      }
    };
    saveQuizSession(nextSession);

    const existing = getQuizProgress(progress, current.id);
    const nextAttempts = existing.attempts + 1;
    const nextCorrect = existing.correctCount + (isCorrect ? 1 : 0);
    const schedule = updateScheduleGeneric(
      existing,
      difficultyToRating[current.difficulty],
      3
    );
    updateQuizProgress(current.id, {
      attempts: nextAttempts,
      correctCount: nextCorrect,
      lastAnsweredAt: new Date().toISOString(),
      lastResult: isCorrect ? 'correct' : 'incorrect',
      nextReviewAt: schedule.nextReviewAt,
      reviewIntervalDays: schedule.reviewIntervalDays,
      easeFactor: schedule.easeFactor
    });

    if (session.settings.mode === 'immediate') {
      setShowFeedback(true);
      setLastCorrect(isCorrect);
    } else {
      goNext(nextSession);
    }
  };

  const goNext = (nextSession = session) => {
    if (currentIndex + 1 >= total) {
      const finished = { ...nextSession, finishedAt: new Date().toISOString() };
      saveQuizSession(finished);
      navigate(`/quizzes/review/${finished.id}`);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!current) return;
    if (event.key >= '1' && event.key <= '9' && current.choices) {
      const index = Number(event.key) - 1;
      const choice = current.choices[index];
      if (!choice) return;
      if (current.type === 'single_choice') {
        setSelected([choice.id]);
      } else {
        setSelected((prev) =>
          prev.includes(choice.id) ? prev.filter((id) => id !== choice.id) : [...prev, choice.id]
        );
      }
      setActiveIndex(index);
    }
    if (event.key === ' ' && current.type === 'multiple_choice' && current.choices) {
      event.preventDefault();
      const choice = current.choices[activeIndex];
      if (!choice) return;
      setSelected((prev) =>
        prev.includes(choice.id) ? prev.filter((id) => id !== choice.id) : [...prev, choice.id]
      );
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!showFeedback) {
        handleSubmit();
      } else {
        goNext();
      }
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min((current.choices?.length ?? 1) - 1, prev + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="space-y-6" onKeyDown={onKeyDown} tabIndex={0} ref={containerRef}>
      <QuizProgressHeader
        current={currentIndex + 1}
        total={total}
        streak={streak}
        accuracy={answered ? correctCount / answered : 0}
        timeLeftSeconds={timeLeft}
      />

      {current.type === 'true_false' ? (
        <div className="glass rounded-2xl p-5">
          <div className="prose prose-invert max-w-none text-sm">
            <h3 className="text-lg font-semibold">True / False</h3>
            <p>{current.promptMarkdown}</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className={`rounded-full border px-4 py-2 text-xs ${selected[0] === 'true' ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
              onClick={() => setSelected(['true'])}
            >
              True
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-xs ${selected[0] === 'false' ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
              onClick={() => setSelected(['false'])}
            >
              False
            </button>
          </div>
        </div>
      ) : (
        <QuizQuestionCard
          question={current}
          selected={selected}
          activeIndex={activeIndex}
          onSelect={setSelected}
          onSetActive={setActiveIndex}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!showFeedback && (
          <button
            className="rounded-full bg-ember-500 px-5 py-2 text-sm font-semibold text-ink-950"
            onClick={handleSubmit}
            disabled={selected.length === 0 && current.type !== 'true_false'}
          >
            Submit
          </button>
        )}
        {showFeedback && (
          <button
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-ink-950"
            onClick={() => goNext()}
          >
            Next
          </button>
        )}
        {session.settings.mode === 'immediate' && showFeedback && (
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
            onClick={() => setShowExplanation((prev) => !prev)}
          >
            {showExplanation ? 'Hide explanation' : 'Show explanation'}
          </button>
        )}
      </div>

      {session.settings.mode === 'immediate' && showFeedback && (
        <div className="glass rounded-2xl p-5 text-sm text-mist-200">
          <p className={`text-sm font-semibold ${lastCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
            {lastCorrect ? 'Correct' : 'Incorrect'}
          </p>
          {showExplanation && (
            <div className="mt-3 text-sm text-mist-200">
              <p>{current.explanationMarkdown}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizSession;
