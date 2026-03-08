import { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';

export default function ChatWindow({ messages, isTyping, onSend }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scrollbar">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={onSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                role={msg.role}
                content={msg.content}
                timestamp={msg.created_at}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </div>
      <ChatInput onSend={onSend} disabled={isTyping} />
    </div>
  );
}
