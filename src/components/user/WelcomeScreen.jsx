import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';
import { SUGGESTION_CHIPS, containerVariants, cardVariants } from '../../lib/constants';

export default function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="w-20 h-20 bg-brew-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coffee size={40} className="text-brew-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-brew-800 mb-2">
          Welcome to BrewIQ! ☕
        </h2>
        <p className="text-brew-500 max-w-md">
          I'm your AI coffee expert. Ask me anything about coffee — brewing methods, beans, our menu, or food pairings!
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full"
      >
        {SUGGESTION_CHIPS.map((chip) => (
          <motion.button
            key={chip.text}
            variants={cardVariants}
            onClick={() => onSuggestionClick(chip.text)}
            className="p-4 bg-white border border-brew-200 rounded-xl text-left text-brew-700 hover:bg-brew-50 hover:border-brew-300 transition cursor-pointer group"
          >
            <span className="text-lg mr-2">{chip.icon}</span>
            <span className="text-sm font-medium group-hover:text-brew-800">{chip.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
