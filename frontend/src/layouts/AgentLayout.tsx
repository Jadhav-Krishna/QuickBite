import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map, Wallet, User, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

export default function AgentLayout() {
  const { user } = useAuth();

  const navItems = [
    { to: "/agent/dashboard", icon: Home, label: "Home" },
    { to: "/agent/navigation", icon: Map, label: "Route" },
    { to: "/agent/earnings", icon: Wallet, label: "Earnings" },
    { to: "/agent/reviews", icon: Star, label: "Reviews" },
    { to: "/agent/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop: Full width, Mobile: Constrained */}
      <div className="w-full lg:max-w-7xl lg:mx-auto">
        <div className="min-h-screen flex flex-col relative max-w-md mx-auto lg:max-w-full">
          {/* Header */}
          <header className="p-4 lg:p-6 sticky top-0 bg-white/95 backdrop-blur-xl z-50 border-b border-slate-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-600 shadow-lg shadow-red-600/20">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="font-display text-lg lg:text-xl font-black text-slate-900">
                    QuickBite <span className="text-red-600">Drive</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Hi, {user?.fullName?.split(' ')[0] || 'Agent'}
                  </p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 px-4 lg:px-6">
            <Outlet />
          </main>

          {/* Bottom Navigation - Mobile Only */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
            <div className="max-w-md mx-auto flex justify-around items-center px-2 py-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.to} 
                    to={item.to}
                    className={({isActive}) => `flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-red-600 text-white' 
                        : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {({isActive}) => (
                      <>
                        <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                        <span className="text-[10px] font-bold">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Desktop Navigation - Sidebar */}
          <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 pt-24">
            <div className="p-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.to} 
                    to={item.to}
                    className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                        : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {({isActive}) => (
                      <>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="font-bold text-sm">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Desktop Content Offset */}
          <div className="hidden lg:block lg:ml-64" />
        </div>
      </div>
    </div>
  );
}
