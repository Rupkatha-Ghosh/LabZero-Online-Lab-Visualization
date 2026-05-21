import { TextFeedbackWordFrequency } from '../../types/feedback.types';

interface WordCloudProps {
  words: TextFeedbackWordFrequency[];
}

const WordCloud = ({ words }: WordCloudProps) => {
  const maxCount = Math.max(...words.map((word) => word.count), 1);

  return (
    <div className="flex min-h-64 flex-wrap content-center items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-5">
      {words.length === 0 && (
        <p className="text-sm text-slate-500">No text responses yet.</p>
      )}
      {words.map((word, index) => {
        const scale = word.count / maxCount;
        const fontSize = 14 + scale * 26;
        const tones = [
          'text-indigo-700 bg-indigo-50',
          'text-cyan-700 bg-cyan-50',
          'text-emerald-700 bg-emerald-50',
          'text-amber-700 bg-amber-50',
          'text-rose-700 bg-rose-50',
        ];

        return (
          <span
            key={word.word}
            className={`rounded-full px-3 py-1 font-bold transition hover:-translate-y-0.5 ${tones[index % tones.length]}`}
            style={{ fontSize }}
            title={`${word.word}: ${word.count}`}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};

export default WordCloud;
