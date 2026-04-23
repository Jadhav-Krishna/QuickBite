import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, Wallet, Bell, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AgentLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = [
    { to: "/agent/dashboard", icon: Home, label: "Home" },
    { to: "/agent/navigation", icon: Map, label: "Route" },
    { to: "/agent/earnings", icon: Wallet, label: "Earnings" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col md:max-w-md md:mx-auto relative shadow-2xl overflow-hidden text-[var(--color-on-surface)]">
      {/* ── Mobile Header ── */}
      <header className="p-5 sticky top-0 bg-[var(--color-surface)]/80 backdrop-blur-xl z-50 border-b border-[var(--color-outline-variant)]/40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[var(--color-primary)]" size={20} />
          <h1 className="font-display font-black text-xl text-[var(--color-on-surface)]">QuickBite <span className="text-[var(--color-primary)]">Drive</span></h1>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse-glow" />
        </button>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto pb-28 pt-2 px-5">
        <Outlet />
      </main>

      <button
        onClick={() => {
          logout();
          navigate('/auth');
        }}
        className="fixed left-1/2 bottom-24 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-lg transition hover:bg-red-50"
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* ── Floating Bottom Navigation ── */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(28rem-2rem)] bg-[var(--color-inverse-surface)]/90 backdrop-blur-xl rounded-[2rem] p-2 flex justify-around items-center shadow-ambient z-50">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({isActive}) => `relative flex flex-col items-center justify-center w-16 h-14 rounded-[1.5rem] transition-all duration-300 ${
                isActive ? 'bg-[var(--color-primary)] text-white scale-105 shadow-glow' : 'text-[var(--color-inverse-on-surface)]/60 hover:text-white'
              }`}
            >
              {({isActive}) => (
                <>
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-sans font-bold mt-1 tracking-wider uppercase transition-all ${isActive ? 'opacity-100' : 'opacity-0 h-0 mt-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
