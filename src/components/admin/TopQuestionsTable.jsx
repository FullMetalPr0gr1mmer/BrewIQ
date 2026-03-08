import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';

const STOP_WORDS = new Set([
  'what', 'that', 'this', 'with', 'have', 'from', 'your', 'about', 'they',
  'been', 'would', 'could', 'should', 'their', 'there', 'which', 'when',
  'make', 'like', 'just', 'know', 'than', 'them', 'some', 'also', 'more',
  'very', 'much', 'does', 'the', 'and', 'for', 'are', 'but', 'not', 'you',
  'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'how', 'its',
]);

export default function TopQuestionsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: messages, error } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('role', 'user');
        if (error) throw error;
        if (messages) {
          const wordCounts = {};
          messages.forEach((m) => {
            const words = m.content.toLowerCase().split(/\s+/);
            words.forEach((w) => {
              const cleaned = w.replace(/[^a-z]/g, '');
              if (cleaned.length > 3 && !STOP_WORDS.has(cleaned)) {
                wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1;
              }
            });
          });
          const sorted = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word, count], i) => ({ rank: i + 1, word, count }));
          setData(sorted);
        }
      } catch (err) {
        console.warn('TopQuestionsTable fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-brew-100">
      <h3 className="text-lg font-semibold text-brew-800 mb-4">Top Chat Topics</h3>
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-brew-400 text-sm">
          No chat data yet. Topics will appear as users chat with BrewIQ.
        </div>
      ) : (
        <div className="overflow-y-auto max-h-72">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brew-400 border-b border-brew-100">
                <th className="pb-2 pr-2 font-medium">#</th>
                <th className="pb-2 font-medium">Topic</th>
                <th className="pb-2 text-right font-medium">Mentions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.word} className="border-b border-brew-50 hover:bg-brew-50/50 transition">
                  <td className="py-2 pr-2 text-brew-400">{row.rank}</td>
                  <td className="py-2 text-brew-700 font-medium capitalize">{row.word}</td>
                  <td className="py-2 text-right text-brew-500">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
