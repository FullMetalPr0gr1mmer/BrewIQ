import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // Wait for profile to load with a timeout
      let attempts = 0;
      const checkProfile = () => {
        const { profile } = useAuthStore.getState();
        if (profile) {
          navigate(profile.role === 'admin' ? '/admin' : '/chat');
        } else if (attempts < 30) {
          attempts++;
          setTimeout(checkProfile, 100);
        } else {
          // Profile didn't load, navigate based on default
          navigate('/chat');
        }
      };
      checkProfile();
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-brew-800">Welcome Back</h2>
        <p className="text-brew-500 mt-2">Sign in to your BrewIQ account</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brew-400" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-brew-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition text-brew-900"
          />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brew-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-brew-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition text-brew-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brew-500 text-white rounded-xl font-semibold hover:bg-brew-400 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none"
      >
        <LogIn size={18} />
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-center text-brew-500 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brew-600 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
