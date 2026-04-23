import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, CreditCard, LogOut, Bell, Search, Settings, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { to: "/admin/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/admin/users", icon: Users, label: "User Control" },
    { to: "/admin/approvals", icon: ShieldCheck, label: "Approvals" },
    { to: "/admin/payments", icon: CreditCard, label: "Financials" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex overflow-hidden">
      {/* ── Gorgeous Dark Sidebar ── */}
      <aside className="w-72 bg-[#0B0F19] text-white flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-white/5">
        <div className="p-8 relative">
          {/* Subtle gradient blob behind logo */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />
          
          <h1 className="font-display font-black text-3xl text-white relative z-10 flex items-center gap-1">
            QuickBite<span className="text-indigo-400">.</span>
          </h1>
          <p className="font-sans text-[10px] text-indigo-200/60 font-bold tracking-[0.2em] uppercase mt-2 relative z-10">
            Command Center
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Core Modules</p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({isActive}) => `relative flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {({isActive}) => (
                  <>
                    {/* Active State Glass Background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-md border border-white/10" />
                    )}
                    {/* Active Indicator Line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-400 rounded-r-full shadow-[0_0_12px_#818cf8]" />
                    )}

                    <Icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10 tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-8 mb-3">System</p>
          <button className="flex w-full items-center gap-4 px-5 py-3.5 rounded-[1.25rem] font-bold text-white/60 transition-all hover:bg-white/5 hover:text-white group">
            <Activity size={20} className="group-hover:text-emerald-400 transition-colors" /> System Health
          </button>
          <button className="flex w-full items-center gap-4 px-5 py-3.5 rounded-[1.25rem] font-bold text-white/60 transition-all hover:bg-white/5 hover:text-white group">
            <Settings size={20} className="group-hover:rotate-45 transition-transform" /> Configurations
          </button>
        </nav>

        <div className="p-6">
          <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-1 mb-2">
            <button 
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="flex w-full items-center justify-center gap-3 px-5 py-3 rounded-[1.25rem] font-bold text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 ml-72 flex flex-col h-screen relative overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        {/* Top Search & Action Bar */}
        <header className="h-24 px-8 md:px-12 flex items-center justify-between sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-2xl border-b border-slate-200/60">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              placeholder="Search users, order IDs, or restaurants... (Press '/')"
              className="w-full bg-white border border-slate-200/80 rounded-full py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">CTRL+K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] border-2 border-white" />
            </button>
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-[2px] shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform">
              <div className="h-full w-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-display font-black text-lg">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
