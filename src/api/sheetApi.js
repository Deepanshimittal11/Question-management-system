import { SAMPLE_SHEET_DATA } from '../data/sampleData';

const API_BASE = 'https://node.codolio.com/api/question-tracker/v1/sheet/public';

function transformApiToStore(data) {
  const topics = data.sheet.config.topicOrder || [];
  const subTopics = data.sheet.config.subTopicOrder || {};
  const questionOrder = data.sheet.config.questionOrder?.length
    ? data.sheet.config.questionOrder
    : data.questions.map((q) => q._id);
  return { topics, subTopics, questions: data.questions, questionOrder };
}

export async function fetchSheetBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/get-sheet-by-slug/${slug}`);
    const json = await res.json();
    if (json.status?.success && json.data) {
      return json.data;
    }
  } catch {
    // Fallback to sample data
  }
  return SAMPLE_SHEET_DATA;
}

export function getInitialStoreData(sheetData) {
  return transformApiToStore(sheetData);
}
