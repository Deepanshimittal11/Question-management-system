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
      <div className="min-h-screen bg-codolio-dark flex items-center justify-center">
        <div className="text-slate-400">Loading sheet...</div>
      </div>
    );
  }

  const totalSolved = questions.filter((q) => q.isSolved).length;
  const totalProgress = questions.length ? Math.round((totalSolved / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-codolio-dark text-slate-200 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-codolio-dark/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{sheetName}</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {totalSolved} / {questions.length} solved · {totalProgress}% complete
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showAddTopic ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (addTopic(newTopicName.trim()), setNewTopicName(''), setShowAddTopic(false))}
                    placeholder="Topic name"
                    className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newTopicName.trim()) addTopic(newTopicName.trim());
                      setNewTopicName('');
                      setShowAddTopic(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                  >
                    Add
                  </button>
                  <button onClick={() => { setShowAddTopic(false); setNewTopicName(''); }} className="px-3 py-2 text-slate-400 hover:text-white text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTopic(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2"
                >
                  <span>+</span> Add Topic
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
