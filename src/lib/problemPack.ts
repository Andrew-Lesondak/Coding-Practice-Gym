import { Problem, ProblemPack } from '../types/problem';
import { SystemDesignPrompt } from '../types/systemDesign';
import { SystemDesignDrill } from '../types/systemDesignDrill';
import { QuizQuestion } from '../types/quiz';
import { ReactCodingProblem } from '../types/reactCoding';
import { ReactDebuggingProblem } from '../types/reactDebugging';

export type OverlayPack = ProblemPack & {
  systemDesignPrompts?: SystemDesignPrompt[];
  systemDesignDrills?: SystemDesignDrill[];
  quizQuestions?: QuizQuestion[];
  reactCodingProblems?: ReactCodingProblem[];
  reactDebuggingProblems?: ReactDebuggingProblem[];
};

export const normalizeOverlayPack = (pack: OverlayPack | null): OverlayPack | null => {
  if (!pack) return null;
  const normalized: OverlayPack = {
    ...pack,
    problems: Array.isArray(pack.problems) ? pack.problems : [],
    systemDesignPrompts: Array.isArray(pack.systemDesignPrompts) ? pack.systemDesignPrompts : [],
    systemDesignDrills: Array.isArray(pack.systemDesignDrills) ? pack.systemDesignDrills : [],
    quizQuestions: Array.isArray(pack.quizQuestions) ? pack.quizQuestions : [],
    reactCodingProblems: Array.isArray(pack.reactCodingProblems) ? pack.reactCodingProblems : [],
    reactDebuggingProblems: Array.isArray(pack.reactDebuggingProblems) ? pack.reactDebuggingProblems : []
  };
  return normalized;
};

export const mergePacks = (base: Problem[], overlay?: Problem[]): Problem[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, Problem>();
  base.forEach((problem) => map.set(problem.id, problem));
  overlay.forEach((problem) => map.set(problem.id, problem));
  return Array.from(map.values());
};

export const mergeSystemDesignPacks = (
  base: SystemDesignPrompt[],
  overlay?: SystemDesignPrompt[]
): SystemDesignPrompt[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, SystemDesignPrompt>();
  base.forEach((prompt) => map.set(prompt.id, prompt));
  overlay.forEach((prompt) => map.set(prompt.id, prompt));
  return Array.from(map.values());
};

export const mergeQuizPacks = (base: QuizQuestion[], overlay?: QuizQuestion[]): QuizQuestion[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, QuizQuestion>();
  base.forEach((question) => map.set(question.id, question));
  overlay.forEach((question) => map.set(question.id, question));
  return Array.from(map.values());
};

export const mergeReactCodingPacks = (
  base: ReactCodingProblem[],
  overlay?: ReactCodingProblem[]
): ReactCodingProblem[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, ReactCodingProblem>();
  base.forEach((problem) => map.set(problem.id, problem));
  overlay.forEach((problem) => map.set(problem.id, problem));
  return Array.from(map.values());
};

export const mergeReactDebuggingPacks = (
  base: ReactDebuggingProblem[],
  overlay?: ReactDebuggingProblem[]
): ReactDebuggingProblem[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, ReactDebuggingProblem>();
  base.forEach((problem) => map.set(problem.id, problem));
  overlay.forEach((problem) => map.set(problem.id, problem));
  return Array.from(map.values());
};
