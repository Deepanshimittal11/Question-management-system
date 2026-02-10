import { create } from 'zustand';

const STORAGE_KEY = 'codolio-sheet-state';

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const generateId = () => Math.random().toString(36).slice(2, 15);

export const useSheetStore = create((set) => ({
  topics: [],
  subTopics: {},
  questions: [],
  questionOrder: [],

  setData: (topics, subTopics, questions, questionOrder) => {
    set({ topics, subTopics, questions, questionOrder });
    saveToStorage({ topics, subTopics, questions, questionOrder });
  },

  addTopic: (name) =>
    set((state) => {
      const next = { topics: [...state.topics, name], subTopics: { ...state.subTopics, [name]: [] }, questions: state.questions, questionOrder: state.questionOrder };
      saveToStorage(next);
      return next;
    }),

  updateTopic: (oldName, newName) =>
    set((state) => {
      const topics = state.topics.map((t) => (t === oldName ? newName : t));
      const subTopics = { ...state.subTopics };
      if (subTopics[oldName]) {
        subTopics[newName] = subTopics[oldName];
        delete subTopics[oldName];
      }
      const questions = state.questions.map((q) =>
        q.topic === oldName ? { ...q, topic: newName } : q
      );
      const next = { topics, subTopics, questions, questionOrder: state.questionOrder };
      saveToStorage(next);
      return next;
    }),

  deleteTopic: (name) =>
    set((state) => {
      const { [name]: _, ...subTopics } = state.subTopics;
      const topics = state.topics.filter((t) => t !== name);
      const questions = state.questions.filter((q) => q.topic !== name);
      const questionOrder = state.questionOrder.filter((id) =>
        questions.some((q) => q._id === id)
      );
      const next = { topics, subTopics, questions, questionOrder };
      saveToStorage(next);
      return next;
    }),

  reorderTopics: (fromIndex, toIndex) =>
    set((state) => {
      const topics = [...state.topics];
      const [removed] = topics.splice(fromIndex, 1);
      topics.splice(toIndex, 0, removed);
      const next = { ...state, topics };
      saveToStorage(next);
      return next;
    }),

  addSubTopic: (topicName, subTopicName) =>
    set((state) => {
      const subTopics = { ...state.subTopics, [topicName]: [...(state.subTopics[topicName] || []), subTopicName] };
      const next = { ...state, subTopics };
      saveToStorage(next);
      return next;
    }),

  updateSubTopic: (topicName, oldName, newName) =>
    set((state) => {
      const subs = (state.subTopics[topicName] || []).map((s) => (s === oldName ? newName : s));
      const questions = state.questions.map((q) =>
        q.topic === topicName && q.subTopic === oldName ? { ...q, subTopic: newName } : q
      );
      const subTopics = { ...state.subTopics, [topicName]: subs };
      const next = { ...state, subTopics, questions };
      saveToStorage(next);
      return next;
    }),

  deleteSubTopic: (topicName, subTopicName) =>
    set((state) => {
      const subs = (state.subTopics[topicName] || []).filter((s) => s !== subTopicName);
      const questions = state.questions.map((q) =>
        q.topic === topicName && q.subTopic === subTopicName ? { ...q, subTopic: null } : q
      );
      const subTopics = { ...state.subTopics, [topicName]: subs };
      const next = { ...state, subTopics, questions };
      saveToStorage(next);
      return next;
    }),

  reorderSubTopics: (topicName, fromIndex, toIndex) =>
    set((state) => {
      const subs = [...(state.subTopics[topicName] || [])];
      const [removed] = subs.splice(fromIndex, 1);
      subs.splice(toIndex, 0, removed);
      const subTopics = { ...state.subTopics, [topicName]: subs };
      const next = { ...state, subTopics };
      saveToStorage(next);
      return next;
    }),

  addQuestion: (question) => {
    const id = generateId();
    const newQuestion = { ...question, _id: id };
    set((state) => {
      const next = {
        questions: [...state.questions, newQuestion],
        questionOrder: [...state.questionOrder, id],
        topics: state.topics,
        subTopics: state.subTopics,
      };
      saveToStorage(next);
      return next;
    });
  },

  updateQuestion: (id, updates) =>
    set((state) => {
      const questions = state.questions.map((q) => (q._id === id ? { ...q, ...updates } : q));
      const next = { ...state, questions };
      saveToStorage(next);
      return next;
    }),

  deleteQuestion: (id) =>
    set((state) => {
      const questions = state.questions.filter((q) => q._id !== id);
      const questionOrder = state.questionOrder.filter((o) => o !== id);
      const next = { ...state, questions, questionOrder };
      saveToStorage(next);
      return next;
    }),

  reorderQuestions: (fromIndex, toIndex) =>
    set((state) => {
      const order = [...state.questionOrder];
      const [removed] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, removed);
      return { questionOrder: order };
    }),

  reorderQuestionsInTopic: (topicName, questionIds) =>
    set((state) => {
      const topicSet = new Set(
        state.questions.filter((q) => q.topic === topicName).map((q) => q._id)
      );
      const questionOrder = [];
      let i = 0;
      while (i < state.questionOrder.length) {
        if (topicSet.has(state.questionOrder[i])) {
          questionOrder.push(...questionIds);
          while (i < state.questionOrder.length && topicSet.has(state.questionOrder[i])) i++;
        } else {
          questionOrder.push(state.questionOrder[i]);
          i++;
        }
      }
      const next = { ...state, questionOrder };
      saveToStorage(next);
      return next;
    }),

  toggleQuestionSolved: (id) =>
    set((state) => {
      const questions = state.questions.map((q) =>
        q._id === id ? { ...q, isSolved: !q.isSolved } : q
      );
      const next = { ...state, questions };
      saveToStorage(next);
      return next;
    }),
}));
