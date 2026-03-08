import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cardVariants } from '../../lib/constants';

export default function StatCard({ title, value, change, icon: Icon, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    let start = 0;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  const isPositive = change > 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className="bg-white rounded-xl p-5 shadow-sm border border-brew-100 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brew-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-brew-800 mt-1">
            {prefix}{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-brew-50 rounded-lg flex items-center justify-center">
            <Icon size={20} className="text-brew-500" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isPositive ? '+' : ''}{change}%</span>
          <span className="text-brew-300 font-normal ml-1">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
