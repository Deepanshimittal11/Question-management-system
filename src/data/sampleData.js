import { buildSampleQuestions } from './questionList';

const { questions, questionOrder, topicOrder } = buildSampleQuestions();

export const SAMPLE_SHEET_DATA = {
  sheet: {
    _id: '66e769b48a15c1adcdf77a47',
    name: 'Codolio SDE Sheet',
    description: 'Codolio SDE Sheet contains handily crafted top coding interview questions from different topics of Data Structures & Algorithms.',
    config: {
      topicOrder: topicOrder.length ? topicOrder : ['Arrays', 'Arrays Part-II', 'Linked List', 'Binary Search', 'Stack and Queue', 'Binary Tree', 'Graph', 'Dynamic Programming', 'Trie'],
      subTopicOrder: {},
      questionOrder,
    },
  },
  questions,
};
