import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white border-t border-brew-100 p-3 sm:p-4">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your coffee question..."
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-brew-50 border border-brew-200 rounded-full text-brew-900 placeholder-brew-300 focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-3 bg-brew-500 text-white rounded-full hover:bg-brew-400 transition disabled:opacity-30 cursor-pointer border-none flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
