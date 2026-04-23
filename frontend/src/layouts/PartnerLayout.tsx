import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3, Star, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PartnerLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const navItems = [
    { to: "/partner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/partner/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/partner/menu", icon: UtensilsCrossed, label: "Menu" },
    { to: "/partner/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/partner/reviews", icon: Star, label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-[var(--color-on-surface)]">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-white border-r border-[var(--color-outline-variant)]/50 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <h1 className="font-display font-black text-3xl text-[var(--color-on-surface)]">
            QuickBite<span className="text-[var(--color-primary)]">.</span>
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase text-[var(--color-primary)]">Partner Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Menu</p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({isActive}) => `relative overflow-hidden flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] text-white shadow-ambient' 
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {({isActive}) => (
                  <>
                    <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[var(--color-outline-variant)]/40 space-y-2">
          <button className="flex w-full items-center gap-4 px-5 py-3 rounded-2xl font-bold text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]">
            <Settings size={20} /> Settings
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="flex w-full items-center gap-4 px-5 py-3 rounded-2xl font-bold text-red-500 transition-all hover:bg-red-50"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/50 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold">Spice Route Kitchen</h2>
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">Open</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse-glow" />
            </button>
            <div className="h-10 w-10 rounded-full bg-[var(--color-surface-variant)] overflow-hidden shadow-inner">
              <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=100&q=80" alt="Restaurant Logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8 md:p-10 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
