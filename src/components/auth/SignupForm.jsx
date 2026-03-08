import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, isAdmin ? 'admin' : 'user');
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-playfair font-bold text-brew-800">Join BrewIQ</h2>
        <p className="text-brew-500 mt-2">Create your account to get started</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brew-400" />
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-brew-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition text-brew-900"
          />
        </div>
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
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-brew-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition text-brew-900"
          />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brew-400" />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-brew-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brew-400 focus:border-transparent transition text-brew-900"
          />
        </div>

        {/* POC admin toggle */}
        <label className="flex items-center gap-3 px-3 py-2 bg-brew-50 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="w-4 h-4 accent-brew-500"
          />
          <Shield size={16} className="text-brew-500" />
          <span className="text-sm text-brew-700">Register as Admin (POC only)</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brew-500 text-white rounded-xl font-semibold hover:bg-brew-400 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border-none"
      >
        <UserPlus size={18} />
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-brew-500 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-brew-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
