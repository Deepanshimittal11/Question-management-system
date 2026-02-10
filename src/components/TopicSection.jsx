import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionRow } from './QuestionRow';

function SortableTopicHeader({ topicName, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `topic-${topicName}` });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <button {...attributes} {...listeners} className="p-1 text-slate-400 hover:text-slate-600 cursor-grab rounded" aria-label="Drag topic">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="4" cy="4" r="1.2" /><circle cx="4" cy="8" r="1.2" /><circle cx="4" cy="12" r="1.2" />
          <circle cx="8" cy="4" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="12" r="1.2" />
        </svg>
      </button>
      <h3 className="text-lg font-semibold text-slate-900">{topicName}</h3>
      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(topicName); }} className="p-1.5 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100" aria-label="Edit topic">✎</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(topicName); }} className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100" aria-label="Delete topic">🗑</button>
      </div>
    </div>
  );
}

export function TopicSection({
  topicName,
  subTopics,
  questions,
  onAddSubTopic,
  onEditSubTopic,
  onDeleteSubTopic,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onToggleSolved,
  onReorderQuestions,
  onEditTopic,
  onDeleteTopic,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q._id === active.id);
    const newIndex = questions.findIndex((q) => q._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(questions, oldIndex, newIndex);
    onReorderQuestions(topicName, reordered.map((q) => q._id));
  };

  const handleAddSubTopic = () => {
    const name = newSubName.trim();
    if (name) {
      onAddSubTopic(topicName, name);
      setNewSubName('');
      setShowAddSub(false);
    }
  };

  const solvedCount = questions.filter((q) => q.isSolved).length;
  const progress = questions.length ? Math.round((solvedCount / questions.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <SortableTopicHeader
          topicName={topicName}
          onEdit={(name) => onEditTopic(name)}
          onDelete={(name) => onDeleteTopic(name)}
        />
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-500">{solvedCount}/{questions.length}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {subTopics.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 text-xs"
              >
                {sub}
                <button
                  onClick={() => onEditSubTopic(topicName, sub, prompt('Edit sub-topic:', sub) || sub)}
                  className="hover:text-emerald-500"
                  aria-label="Edit"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDeleteSubTopic(topicName, sub)}
                  className="hover:text-rose-500"
                  aria-label="Delete"
                >
                  ×
                </button>
              </span>
            ))}
            {showAddSub ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubTopic()}
                  placeholder="Sub-topic name"
                  className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleAddSubTopic}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium shadow-sm shadow-emerald-500/30"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddSub(false); setNewSubName(''); }}
                  className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSub(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 text-xs transition-colors bg-slate-50"
              >
                + Add sub-topic
              </button>
            )}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {questions.map((q) => (
                  <QuestionRow
                    key={q._id}
                    question={q}
                    onToggleSolved={onToggleSolved}
                    onEdit={onEditQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={() => onAddQuestion(topicName)}
            className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors text-sm font-medium bg-slate-50"
          >
            + Add question
          </button>
        </div>
      )}
    </div>
  );
}
