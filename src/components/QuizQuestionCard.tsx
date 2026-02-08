import ReactMarkdown from 'react-markdown';
import { QuizQuestion } from '../types/quiz';
import QuizChoiceList from './QuizChoiceList';

type QuizQuestionCardProps = {
  question: QuizQuestion;
  selected: string[];
  activeIndex: number;
  onSelect: (next: string[]) => void;
  onSetActive: (index: number) => void;
};

const QuizQuestionCard = ({ question, selected, activeIndex, onSelect, onSetActive }: QuizQuestionCardProps) => {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-mist-300">
        <span className="rounded-full border border-white/10 px-2 py-1">{question.topic}</span>
        <span className="rounded-full border border-white/10 px-2 py-1">{question.subtopic}</span>
        <span className="rounded-full border border-white/10 px-2 py-1">{question.difficulty}</span>
      </div>
      <div className="prose prose-invert mt-4 max-w-none text-sm">
        <ReactMarkdown>{question.promptMarkdown}</ReactMarkdown>
      </div>
      {question.type !== 'true_false' && question.choices && (
        <div className="mt-4">
          <QuizChoiceList
            type={question.type}
            choices={question.choices}
            selected={selected}
            activeIndex={activeIndex}
            onSelect={onSelect}
            onSetActive={onSetActive}
          />
        </div>
      )}
    </div>
  );
};

export default QuizQuestionCard;
