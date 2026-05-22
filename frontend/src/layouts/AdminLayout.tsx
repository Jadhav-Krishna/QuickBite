import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, CreditCard, LogOut, Bell, Search, Settings, Activity, Star, X, Bike } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { notificationService, type NotificationDTO } from '../api/notification';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      void fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.userId) return;
    try {
      const data = await notificationService.getUserNotifications(user.userId);
      setNotifications(data.slice(0, 10));
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Set empty notifications instead of showing error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { to: "/admin/overview", icon: LayoutDashboard, label: "Overview" },
    { to: "/admin/users", icon: Users, label: "User Control" },
    { to: "/admin/agents", icon: Bike, label: "Agents" },
    { to: "/admin/approvals", icon: ShieldCheck, label: "Approvals" },
    { to: "/admin/payments", icon: CreditCard, label: "Financials" },
    { to: "/admin/reviews", icon: Star, label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex overflow-hidden">
      {/* ── Sidebar with Red Theme ── */}
      <aside className="w-72 bg-white text-slate-900 flex flex-col fixed h-full z-20 shadow-xl border-r border-slate-200">
        <div className="p-8 relative border-b border-slate-200">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-red-500/10 to-rose-500/10 blur-3xl pointer-events-none" />
          
          <h1 className="font-display font-black text-3xl text-slate-900 relative z-10 flex items-center gap-1">
            QuickBite<span className="text-red-600">.</span>
          </h1>
          <p className="font-sans text-[10px] text-red-600/80 font-bold tracking-[0.2em] uppercase mt-2 relative z-10">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Core Modules</p>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className={({isActive}) => `relative flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-200 group overflow-hidden ${
                  isActive 
                    ? 'text-white bg-red-600 shadow-lg shadow-red-600/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-red-600'
                }`}
              >
                {({isActive}) => (
                  <>
                    <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-8 mb-3">System</p>
          <button 
            onClick={() => navigate('/admin/system-health')}
            className="flex w-full items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 group"
          >
            <Activity size={20} className="group-hover:text-emerald-500 transition-colors" /> System Health
          </button>
          <button 
            onClick={() => navigate('/admin/configuration')}
            className="flex w-full items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 group"
          >
            <Settings size={20} className="group-hover:rotate-45 transition-transform" /> Configuration
          </button>
        </nav>

        <div className="p-6 border-t border-slate-200">
          <button 
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="flex w-full items-center justify-center gap-3 px-5 py-3 rounded-xl font-bold text-red-600 border border-red-200 transition-all hover:bg-red-50"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 ml-72 flex flex-col h-screen relative overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
        {/* Top Search & Action Bar */}
        <header className="h-24 px-8 md:px-12 flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200">
          <form onSubmit={handleSearch} className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input 
              id="admin-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, orders, restaurants..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-12 pr-24 text-sm font-medium text-slate-700 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">CTRL+K</span>
            </div>
          </form>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-8 text-center text-sm text-slate-500">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => void handleMarkAsRead(notif.id)}
                          className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-slate-50 ${
                            !notif.isRead ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!notif.isRead && <div className="mt-2 h-2 w-2 rounded-full bg-red-600 flex-shrink-0" />}
                            <div className="flex-1">
                              <p className="font-bold text-sm text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 p-[2px] shadow-lg shadow-red-500/20 cursor-pointer hover:scale-105 transition-transform">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-red-600 font-display font-black text-lg">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
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
