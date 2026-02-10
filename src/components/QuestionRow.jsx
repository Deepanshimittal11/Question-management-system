import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const difficultyColors = {
  Easy: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Hard: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

export function QuestionRow({ question, onToggleSolved, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        isDragging
          ? 'border-emerald-500/80 bg-emerald-50 shadow-xl shadow-emerald-200/70 opacity-95'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-slate-400 hover:text-slate-600 rounded"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="4" cy="4" r="1.2" /><circle cx="4" cy="8" r="1.2" /><circle cx="4" cy="12" r="1.2" />
          <circle cx="8" cy="4" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="12" r="1.2" />
        </svg>
      </button>
      <button
        onClick={() => onToggleSolved(question._id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          question.isSolved
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-500 hover:border-emerald-400'
        }`}
        aria-label={question.isSolved ? 'Mark as unsolved' : 'Mark as solved'}
      >
        {question.isSolved && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <a
          href={question.questionId.problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block truncate font-medium hover:text-emerald-300 transition-colors ${
            question.isSolved ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {question.title}
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
              difficultyColors[question.questionId.difficulty] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            <span>{question.questionId.difficulty}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>{question.questionId.platform}</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {question.resource && (
          <a
            href={question.resource}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
            title="Video resource"
            aria-label="Open video resource"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </a>
        )}
        <button
          onClick={() => onEdit(question)}
          className="p-2 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100 transition-colors"
          aria-label="Edit question"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(question._id)}
          className="p-2 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
          aria-label="Delete question"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
