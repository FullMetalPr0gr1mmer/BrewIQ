import { Coffee } from 'lucide-react';

export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-xl' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-4xl' },
    xl: { icon: 56, text: 'text-6xl' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coffee size={s.icon} className="text-brew-400" />
      <span className={`font-playfair font-bold ${s.text}`}>BrewIQ</span>
    </div>
  );
}
