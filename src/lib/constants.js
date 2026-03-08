export const APP_NAME = 'BrewIQ';
export const APP_TAGLINE = 'Smart Coffee. Smarter Business.';

export const SUGGESTION_CHIPS = [
  { text: 'What\'s the best cold brew method?', icon: '☕' },
  { text: 'Latte vs Cappuccino — what\'s the difference?', icon: '🤔' },
  { text: 'What beans work best for espresso?', icon: '🫘' },
  { text: 'What pairs well with a croissant?', icon: '🥐' },
];

// Framer Motion animation variants
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export const bubbleVariants = {
  initial: (isUser) => ({ opacity: 0, x: isUser ? 20 : -20 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export const dotVariants = {
  animate: { y: [0, -6, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2 } }
};
