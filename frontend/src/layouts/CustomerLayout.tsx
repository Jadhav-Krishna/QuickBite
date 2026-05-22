import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import FoodAppNavbar from '../components/FoodAppNavbar';
import ScrollToTop from '../components/ScrollToTop';
import NotificationBell from '../components/NotificationBell';

const NAV_LINKS = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/customer/history', label: 'Orders' },
  { to: '/wallet', label: 'Wallet' },
];

export default function CustomerLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const initials = user
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">

      {/* ── Persistent Navbar (hidden on landing — landing has its own) ── */}
      {!isLandingPage && (
        <header className="sticky top-0 z-50 border-b border-[var(--color-surface-variant)]/60 bg-[var(--color-surface)]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">

            {/* Logo */}
            <Link to="/" className="font-display text-2xl font-black text-red-600">
              QuickBite
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotificationBell />
              
              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User avatar or sign-in */}
              {user ? (
                <div className="relative group">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-sm font-bold text-white shadow-lg transition hover:scale-105"
                    aria-label="User menu"
                  >
                    {initials}
                  </button>
                  {/* Dropdown */}
                  <div className="invisible absolute right-0 top-12 z-50 w-52 origin-top-right scale-95 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                    <div className="border-b border-slate-200 px-3 py-2 mb-1">
                      <p className="font-bold text-sm text-slate-900 line-clamp-1">{user.fullName}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/customer/addresses" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600">
                      📍 Saved Addresses
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Food App Navbar */}
      <FoodAppNavbar />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
