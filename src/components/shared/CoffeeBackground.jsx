import { motion } from 'framer-motion';

const particles = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 4 + Math.random() * 4,
  size: 4 + Math.random() * 8,
}));

export default function CoffeeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-brew-50 to-brew-100" />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-brew-200/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: '-10px',
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
