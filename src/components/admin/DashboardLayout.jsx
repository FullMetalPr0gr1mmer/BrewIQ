import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Menu, X, Coffee } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/chats', icon: MessageSquare, label: 'Chat Logs' },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-brew-200/50">
        <div className="flex items-center gap-2">
          <Coffee size={24} className="text-brew-400" />
          <span className="font-playfair font-bold text-xl text-brew-800">BrewIQ</span>
        </div>
        <span className="text-xs text-brew-400 mt-1 block">Admin Panel</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition no-underline ${
                isActive
                  ? 'bg-brew-100 text-brew-700'
                  : 'text-brew-600 hover:bg-brew-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-brew-200/50">
        <div className="text-sm text-brew-700 font-medium truncate">{profile?.full_name || 'Admin'}</div>
        <div className="text-xs text-brew-400 truncate mb-3">{profile?.email}</div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-accent-red hover:opacity-80 transition bg-transparent border-none cursor-pointer p-0"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-brew-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 bg-white border-r border-brew-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 bg-white shadow-xl z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-brew-500"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-brew-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-transparent border-none cursor-pointer text-brew-700 p-1"
          >
            <Menu size={22} />
          </button>
          <span className="font-playfair font-bold text-brew-800">BrewIQ Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
