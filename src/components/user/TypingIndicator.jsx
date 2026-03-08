import { motion } from 'framer-motion';

const dotVariants = {
  animate: (i) => ({
    y: [0, -6, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: i * 0.15 },
  }),
};

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div>
        <span className="text-xs text-brew-400 mb-1 block">☕ BrewIQ</span>
        <div className="bg-brew-100 px-5 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-2 h-2 bg-brew-400 rounded-full inline-block"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
