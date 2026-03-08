import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Download, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportChatsToXLSX } from '../../lib/exportUtils';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ChatLogViewer() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [dateFrom, dateTo]);

  async function fetchSessions() {
    setLoading(true);
    let query = supabase
      .from('chat_sessions')
      .select('*, profiles(email, full_name)')
      .order('started_at', { ascending: false });

    if (dateFrom) query = query.gte('started_at', dateFrom);
    if (dateTo) query = query.lte('started_at', dateTo + 'T23:59:59');

    const { data } = await query;
    setSessions(data || []);
    setLoading(false);
  }

  async function toggleExpand(sessionId) {
    if (expandedId === sessionId) {
      setExpandedId(null);
      setExpandedMessages([]);
      return;
    }
    setExpandedId(sessionId);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');
    setExpandedMessages(data || []);
  }

  async function handleExport() {
    setExporting(true);
    // Fetch all messages for filtered sessions
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) {
      setExporting(false);
      return;
    }

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*, chat_sessions(satisfaction_rating, profiles(email))')
      .in('session_id', sessionIds)
      .order('created_at');

    if (messages) {
      const rows = messages.map((m) => ({
        email: m.chat_sessions?.profiles?.email || 'N/A',
        session_id: m.session_id,
        role: m.role,
        content: m.content,
        created_at: m.created_at,
        satisfaction_rating: m.chat_sessions?.satisfaction_rating,
      }));
      exportChatsToXLSX(rows);
    }
    setExporting(false);
  }

  const filtered = sessions.filter((s) => {
    const email = s.profiles?.email || '';
    const name = s.profiles?.full_name || '';
    const q = search.toLowerCase();
    return email.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  function renderStars(rating) {
    if (!rating) return <span className="text-brew-300 text-xs">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-brew-200'} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brew-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-brew-200 rounded-xl bg-white text-brew-900 placeholder-brew-300 focus:outline-none focus:ring-2 focus:ring-brew-400 text-sm"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2.5 border border-brew-200 rounded-xl text-sm text-brew-700 focus:outline-none focus:ring-2 focus:ring-brew-400"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2.5 border border-brew-200 rounded-xl text-sm text-brew-700 focus:outline-none focus:ring-2 focus:ring-brew-400"
        />
        <button
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-brew-500 text-white rounded-xl text-sm font-medium hover:bg-brew-400 transition disabled:opacity-50 cursor-pointer border-none whitespace-nowrap"
        >
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export XLSX'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-brew-400 border border-brew-100">
          No chat sessions found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brew-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brew-50 text-left text-brew-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Messages</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    expanded={expandedId === session.id}
                    messages={expandedId === session.id ? expandedMessages : []}
                    onToggle={() => toggleExpand(session.id)}
                    renderStars={renderStars}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionRow({ session, expanded, messages, onToggle, renderStars }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-brew-50 hover:bg-brew-50/50 transition cursor-pointer"
      >
        <td className="px-4 py-3">
          <div className="font-medium text-brew-800">{session.profiles?.full_name || 'Anonymous'}</div>
          <div className="text-xs text-brew-400">{session.profiles?.email}</div>
        </td>
        <td className="px-4 py-3 text-brew-600">{session.message_count || 0}</td>
        <td className="px-4 py-3 text-brew-600">
          {new Date(session.started_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">{renderStars(session.satisfaction_rating)}</td>
        <td className="px-4 py-3">
          {expanded ? <ChevronUp size={16} className="text-brew-400" /> : <ChevronDown size={16} className="text-brew-400" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-4 py-4 bg-brew-50/30">
            {messages.length === 0 ? (
              <p className="text-brew-400 text-sm text-center py-4">No messages in this session.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto chat-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 text-sm">
                    <span className={`font-medium w-6 flex-shrink-0 ${msg.role === 'user' ? 'text-brew-600' : 'text-brew-400'}`}>
                      {msg.role === 'user' ? '👤' : '☕'}
                    </span>
                    <div>
                      <p className="text-brew-800">{msg.content}</p>
                      <p className="text-[10px] text-brew-300 mt-0.5">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
