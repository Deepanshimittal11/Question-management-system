import { useState, useEffect } from 'react';

export function QuestionForm({ topic, subTopic, topics, subTopics, initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [selectedTopic, setSelectedTopic] = useState(initial?.topic ?? topic);
  const [selectedSubTopic, setSelectedSubTopic] = useState(initial?.subTopic ?? subTopic ?? null);
  const [problemUrl, setProblemUrl] = useState(initial?.questionId?.problemUrl ?? '');
  const [resource, setResource] = useState(initial?.resource ?? '');
  const [difficulty, setDifficulty] = useState(initial?.questionId?.difficulty ?? 'Medium');

  useEffect(() => {
    setSelectedTopic(initial?.topic ?? topic);
    setSelectedSubTopic(initial?.subTopic ?? subTopic ?? null);
  }, [initial, topic, subTopic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      topic: selectedTopic,
      subTopic: selectedSubTopic,
      title: title.trim(),
      problemUrl: problemUrl || undefined,
      resource: resource || undefined,
      difficulty,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Question Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Two Sum"
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
        <select
          value={selectedTopic}
          onChange={(e) => {
            setSelectedTopic(e.target.value);
            setSelectedSubTopic(null);
          }}
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {(subTopics[selectedTopic]?.length ?? 0) > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sub-topic (optional)</label>
          <select
            value={selectedSubTopic ?? ''}
            onChange={(e) => setSelectedSubTopic(e.target.value || null)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">None</option>
            {(subTopics[selectedTopic] || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Problem URL</label>
        <input
          type="url"
          value={problemUrl}
          onChange={(e) => setProblemUrl(e.target.value)}
          placeholder="https://leetcode.com/problems/..."
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Resource / Video URL</label>
        <input
          type="url"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          placeholder="https://youtu.be/..."
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
        >
          {initial ? 'Update' : 'Add'} Question
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
