import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import Logo from '../shared/Logo';
import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

export default function Navbar({ transparent = false }) {
  const { isAuthenticated, isAdmin, profile } = useAuth();
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navClass = transparent
    ? 'absolute top-0 left-0 right-0 z-50 bg-transparent text-white'
    : 'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brew-100 text-brew-900';

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="no-underline">
            <Logo size="sm" className={transparent ? 'text-white' : 'text-brew-900'} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className={`font-medium hover:opacity-80 transition no-underline ${transparent ? 'text-white' : 'text-brew-700'}`}>
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-brew-500 text-white rounded-full font-medium hover:bg-brew-400 transition no-underline">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin" className={`font-medium hover:opacity-80 transition no-underline ${transparent ? 'text-white' : 'text-brew-700'}`}>
                      Dashboard
                    </Link>
                    <Link to="/admin/chats" className={`font-medium hover:opacity-80 transition no-underline ${transparent ? 'text-white' : 'text-brew-700'}`}>
                      Chat Logs
                    </Link>
                  </>
                ) : (
                  <Link to="/chat" className={`font-medium hover:opacity-80 transition no-underline ${transparent ? 'text-white' : 'text-brew-700'}`}>
                    Chat
                  </Link>
                )}
                <span className={`text-sm ${transparent ? 'text-white/70' : 'text-brew-400'}`}>
                  {profile?.full_name || profile?.email}
                </span>
                <button onClick={handleSignOut} className="flex items-center gap-1 text-sm font-medium text-accent-red hover:opacity-80 transition cursor-pointer bg-transparent border-none p-0">
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden bg-transparent border-none cursor-pointer p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-brew-700 no-underline">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-brew-700 no-underline">Sign Up</Link>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-brew-700 no-underline">Dashboard</Link>
                    <Link to="/admin/chats" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-brew-700 no-underline">Chat Logs</Link>
                  </>
                ) : (
                  <Link to="/chat" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-brew-700 no-underline">Chat</Link>
                )}
                <button onClick={handleSignOut} className="flex items-center gap-1 py-2 text-accent-red font-medium bg-transparent border-none cursor-pointer p-0">
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
