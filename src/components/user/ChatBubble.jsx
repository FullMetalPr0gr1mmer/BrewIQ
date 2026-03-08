import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { bubbleVariants } from '../../lib/constants';

export default function ChatBubble({ role, content, timestamp }) {
  const isUser = role === 'user';

  return (
    <motion.div
      custom={isUser}
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className="group relative max-w-[80%] sm:max-w-[70%]">
        {!isUser && (
          <span className="text-xs text-brew-400 mb-1 block">☕ BrewIQ</span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed ${
            isUser
              ? 'bg-brew-500 text-white rounded-br-md'
              : 'bg-brew-100 text-brew-900 rounded-bl-md'
          }`}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => <code className="bg-brew-200/50 px-1 rounded text-sm">{children}</code>,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
        {timestamp && (
          <span className="text-[10px] text-brew-300 mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
