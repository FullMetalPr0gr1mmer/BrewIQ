import { Coffee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brew-900 text-brew-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee size={20} className="text-brew-400" />
            <span className="font-playfair font-bold text-white">BrewIQ</span>
          </div>
          <p className="text-sm text-brew-300">
            &copy; {new Date().getFullYear()} BrewIQ. Smart Coffee. Smarter Business.
          </p>
        </div>
      </div>
    </footer>
  );
}
