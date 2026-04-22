import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/customer/history', label: 'Orders' },
  { to: '/wallet', label: 'Wallet' },
];

export default function CustomerLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);
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
            <Link to="/" className="font-display text-2xl font-black text-[var(--color-primary)]">
              QuickBite
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--color-on-surface-variant)] md:flex">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`transition hover:text-[var(--color-primary)] ${location.pathname.startsWith(to) ? 'text-[var(--color-primary)]' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]"
              >
                <Bell size={18} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white animate-pulse-glow">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User avatar or sign-in */}
              {user ? (
                <div className="relative group">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] text-sm font-bold text-white shadow-card transition hover:scale-105"
                    aria-label="User menu"
                  >
                    {initials}
                  </button>
                  {/* Dropdown */}
                  <div className="invisible absolute right-0 top-12 z-50 w-52 origin-top-right scale-95 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white p-2 opacity-0 shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                    <div className="border-b border-[var(--color-surface-variant)] px-3 py-2 mb-1">
                      <p className="font-bold text-sm text-[var(--color-on-surface)] line-clamp-1">{user.fullName}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-1">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/customer/addresses" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]">
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
                  className="ml-1 rounded-full border border-[var(--color-outline-variant)] bg-white/70 px-4 py-2 text-sm font-bold text-[var(--color-on-surface)] backdrop-blur transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] md:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Mobile slide-over menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="animate-slide-right absolute left-0 top-0 h-full w-72 bg-white shadow-[16px_0_64px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-surface-variant)]">
              <span className="font-display text-xl font-black text-[var(--color-primary)]">QuickBite</span>
              <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]">
                <X size={18} />
              </button>
            </div>
            {user && (
              <div className="flex items-center gap-3 border-b border-[var(--color-surface-variant)] px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] text-base font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{user.fullName}</p>
                  <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-1">{user.email}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1 p-3">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]"
                >
                  {label}
                </Link>
              ))}
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]">Profile</Link>
              <Link to="/notifications" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]">Notifications</Link>
            </nav>
            {user && (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={15} /> Sign Out
              </button>
            )}
            {!user && (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="mx-3 mt-2 block rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-bold text-white">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
