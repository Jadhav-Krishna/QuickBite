import { ArrowRight, Bike, ShieldCheck, Store, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const portalCards = [
  {
    title: 'Customer',
    description: 'Order food, save favorites, and track delivery.',
    to: '/login',
    icon: User,
  },
  {
    title: 'Restaurant Partner',
    description: 'Manage menus, orders, and storefront performance.',
    to: '/partner/dashboard',
    icon: Store,
  },
  {
    title: 'Delivery Courier',
    description: 'Navigate routes and track earnings on your schedule.',
    to: '/agent/dashboard',
    icon: Bike,
  },
  {
    title: 'Platform Admin',
    description: 'Oversee users, approvals, and payments across QuickBite.',
    to: '/admin/overview',
    icon: ShieldCheck,
  },
];

export default function AuthLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-surface)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(181,35,48,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,90,95,0.12),transparent_28%)]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <Link to="/" className="font-display text-3xl font-black italic tracking-tight text-[var(--color-primary)]">
          QuickBite
        </Link>
        <Link to="/restaurants" className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]">
          Browse Menu
        </Link>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5.5rem)] w-full max-w-7xl gap-10 px-6 pb-12 pt-4 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="max-w-2xl">
          <span className="mb-5 inline-flex rounded-full bg-[var(--color-surface-container)] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            The Gastronomic Monograph
          </span>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] text-[#261817] md:text-7xl">
            Exciting Treats,
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] bg-clip-text text-transparent">
              Available Daily
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-on-surface-variant)] md:text-2xl">
            Indulge in our curated gourmet experiences. Luxury dining brought to your table with a single tap, then continue into the role-specific workspace you need.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/signup" className="hero-button inline-flex min-h-14 items-center justify-center rounded-full px-8 text-lg font-bold text-[var(--color-on-primary)] shadow-[0_10px_40px_rgba(181,35,48,0.24)]">
              Get Started
            </Link>
            <Link to="/login" className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-[var(--color-outline-variant)] px-8 text-lg font-bold transition hover:bg-[var(--color-surface-container)]">
              Login
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {portalCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="group ambient-shadow flex items-center justify-between rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 transition hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">{item.description}</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-[var(--color-primary)] transition group-hover:translate-x-1" />
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
