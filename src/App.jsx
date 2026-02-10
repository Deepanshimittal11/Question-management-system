import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSheetStore } from './store/sheetStore';
import { getInitialStoreData } from './api/sheetApi';
import { SAMPLE_SHEET_DATA } from './data/sampleData';
import { Modal } from './components/Modal';
import { TopicSection } from './components/TopicSection';
import { QuestionForm } from './components/QuestionForm';

function App() {
  const {
    topics,
    subTopics,
    questions,
    questionOrder,
    setData,
    addTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
    addSubTopic,
    updateSubTopic,
    deleteSubTopic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestionsInTopic,
    toggleQuestionSolved,
  } = useSheetStore();

  const [sheetName, setSheetName] = useState('Codolio SDE Sheet');
  const [loading, setLoading] = useState(true);
  const [questionModal, setQuestionModal] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = (() => {
        try {
          const raw = localStorage.getItem('codolio-sheet-state');
          if (raw) {
            const p = JSON.parse(raw);
            if (p?.topics?.length) return p;
          }
        } catch {}
        return null;
      })();
      if (stored) {
        setData(stored.topics, stored.subTopics, stored.questions, stored.questionOrder);
        setSheetName('Codolio SDE Sheet');
        setLoading(false);
        return;
      }
      try {
        const data = await fetch('https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet')
          .then((r) => r.json());
        if (data?.status?.success && data?.data) {
          const { topics: t, subTopics: st, questions: q, questionOrder: qo } = getInitialStoreData(data.data);
          setData(t, st, q, qo);
          setSheetName(data.data.sheet?.name ?? 'Codolio SDE Sheet');
        } else throw new Error('Fallback');
      } catch {
        const { topics: t, subTopics: st, questions: q, questionOrder: qo } = getInitialStoreData(SAMPLE_SHEET_DATA);
        setData(t, st, q, qo);
        setSheetName(SAMPLE_SHEET_DATA.sheet.name);
      }
      setLoading(false);
    })();
  }, [setData]);

  const orderedTopics = topics;
  const questionMap = new Map(questions.map((q) => [q._id, q]));
  const orderedQuestionIds = questionOrder.filter((id) => questionMap.has(id));

  const getQuestionsByTopic = (topic) => {
    const idsInTopic = orderedQuestionIds.filter((id) => questionMap.get(id)?.topic === topic);
    return idsInTopic.map((id) => questionMap.get(id)).filter(Boolean);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleTopicDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = orderedTopics.findIndex((t) => `topic-${t}` === active.id);
    const toIdx = orderedTopics.findIndex((t) => `topic-${t}` === over.id);
    if (fromIdx >= 0 && toIdx >= 0) reorderTopics(fromIdx, toIdx);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="px-6 py-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <p className="text-sm font-medium tracking-wide text-slate-300">Loading your sheet…</p>
          <p className="mt-2 text-xs text-slate-500">Fetching questions and progress from Codolio.</p>
        </div>
      </div>
    );
  }

  const totalSolved = questions.filter((q) => q.isSolved).length;
  const totalProgress = questions.length ? Math.round((totalSolved / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-end gap-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {sheetName}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400">
                <span className="font-medium text-slate-200">
                  {totalSolved} / {questions.length} solved
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span>{totalProgress}% complete</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-sky-400 transition-all"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 min-w-[3rem] text-right">
                  {totalProgress}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {showAddTopic ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (addTopic(newTopicName.trim()), setNewTopicName(''), setShowAddTopic(false))}
                    placeholder="New topic name"
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newTopicName.trim()) addTopic(newTopicName.trim());
                      setNewTopicName('');
                      setShowAddTopic(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium shadow-sm shadow-indigo-500/40"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddTopic(false); setNewTopicName(''); }}
                    className="px-3 py-2 text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTopic(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500/25 hover:border-indigo-400 transition-colors"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                    +
                  </span>
                  <span>Add topic</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-300">
                Curate and track all your DSA practice in one place.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Drag topics and questions to reorder, mark them as solved, and keep your prep on track.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{totalSolved} solved</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>{questions.length - totalSolved} pending</span>
              </span>
            </div>
          </div>
        </section>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
          <SortableContext items={orderedTopics.map((t) => `topic-${t}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {orderedTopics.map((topic) => (
                <TopicSection
                  key={topic}
                  topicName={topic}
                  subTopics={subTopics[topic] || []}
                  questions={getQuestionsByTopic(topic)}
                  onAddSubTopic={addSubTopic}
                  onEditSubTopic={(t, old, newName) => {
                    if (newName && newName !== old) updateSubTopic(t, old, newName);
                  }}
                  onDeleteSubTopic={deleteSubTopic}
                  onAddQuestion={(t, sub) => setQuestionModal({ topic: t, subTopic: sub ?? null })}
                  onEditQuestion={(q) => setQuestionModal({ topic: q.topic, subTopic: q.subTopic, edit: q })}
                  onDeleteQuestion={(id) => {
                    if (confirm('Delete this question?')) deleteQuestion(id);
                  }}
                  onToggleSolved={toggleQuestionSolved}
                  onReorderQuestions={reorderQuestionsInTopic}
                  onEditTopic={(name) => {
                    const newName = prompt('New topic name:', name);
                    if (newName?.trim() && newName !== name) updateTopic(name, newName.trim());
                  }}
                  onDeleteTopic={(name) => {
                    if (confirm(`Delete topic "${name}" and all its questions?`)) deleteTopic(name);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {orderedTopics.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-dashed border-slate-600">
            <p className="text-slate-400 mb-4">No topics yet. Add your first topic to get started.</p>
            <button
              onClick={() => setShowAddTopic(true)}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              + Add Topic
            </button>
          </div>
        )}
      </main>

      <Modal
        isOpen={!!questionModal}
        onClose={() => setQuestionModal(null)}
        title={questionModal?.edit ? 'Edit Question' : 'Add Question'}
      >
        {questionModal && (
          <QuestionForm
            topic={questionModal.topic}
            subTopic={questionModal.subTopic}
            topics={topics}
            subTopics={subTopics}
            initial={questionModal.edit}
            onSubmit={(data) => {
              if (questionModal.edit) {
                updateQuestion(questionModal.edit._id, {
                  topic: data.topic,
                  subTopic: data.subTopic,
                  title: data.title,
                  resource: data.resource,
                  questionId: {
                    ...questionModal.edit.questionId,
                    problemUrl: data.problemUrl || questionModal.edit.questionId.problemUrl,
                    difficulty: data.difficulty || questionModal.edit.questionId.difficulty,
                  },
                });
              } else {
                addQuestion({
                  topic: data.topic,
                  subTopic: data.subTopic,
                  title: data.title,
                  questionId: {
                    _id: '',
                    platform: 'custom',
                    slug: '',
                    difficulty: data.difficulty || 'Medium',
                    name: data.title,
                    problemUrl: data.problemUrl || '',
                  },
                  resource: data.resource,
                });
              }
              setQuestionModal(null);
            }}
            onCancel={() => setQuestionModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
