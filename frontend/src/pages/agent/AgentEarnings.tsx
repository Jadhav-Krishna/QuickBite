import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Banknote, Calendar, ChevronRight, Activity, Wallet } from 'lucide-react';

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const FALLBACK_HISTORY = [
  { date: 'Today', deliveries: 8, amount: 950 },
  { date: 'Yesterday', deliveries: 12, amount: 1420 },
  { date: 'Oct 24', deliveries: 10, amount: 1100 },
  { date: 'Oct 23', deliveries: 15, amount: 1850 },
  { date: 'Oct 22', deliveries: 5, amount: 620 },
  { date: 'Oct 21', deliveries: 11, amount: 1340 },
  { date: 'Oct 20', deliveries: 9, amount: 1080 },
];

export default function AgentEarnings() {
  const [history] = useState(FALLBACK_HISTORY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const weeklySummary = useMemo(() => {
    return {
      deliveries: history.reduce((sum, h) => sum + h.deliveries, 0),
      estimatedPay: history.reduce((sum, h) => sum + h.amount, 0),
      activeDays: history.length,
    };
  }, [history]);

  if (loading) {
    return (
      <div className="space-y-6 pt-4 animate-pulse">
        <div className="h-10 w-48 skeleton rounded-full" />
        <div className="h-64 skeleton rounded-[2.5rem]" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-3xl" />)}
        </div>
      </div>
    );
  }

  // Find max amount to calculate bar heights
  const maxAmount = Math.max(...history.map(h => h.amount));

  return (
    <div className="space-y-6 pt-4 pb-10 animate-fade-up">
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl font-black">Earnings</h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
          <Banknote size={20} />
        </div>
      </header>

      {/* ── Main Earnings Card ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--color-inverse-surface)] to-black p-8 text-white shadow-glow">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-primary)]/30 blur-3xl" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">This Week's Pay</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 className="font-display text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              {formatCurrency(weeklySummary.estimatedPay)}
            </h2>
            <div className="mb-2 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-bold text-green-400">
              <TrendingUp size={12} /> +12%
            </div>
          </div>

          {/* Simple Chart */}
          <div className="mt-8 flex h-24 items-end justify-between gap-2 border-b border-white/10 pb-2">
            {history.slice().reverse().map((h, i) => {
              const heightPercentage = (h.amount / maxAmount) * 100;
              const isToday = i === history.length - 1;
              return (
                <div key={i} className="flex w-full flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 hidden group-hover:block rounded bg-white px-2 py-1 text-[10px] font-bold text-black">
                      {formatCurrency(h.amount)}
                    </div>
                    <div 
                      className={`w-full max-w-[12px] rounded-t-full transition-all duration-1000 ease-out ${isToday ? 'bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]' : 'bg-white/20 hover:bg-white/40'}`} 
                      style={{ height: `${heightPercentage}%`, minHeight: '10%' }} 
                    />
                  </div>
                  <span className={`text-[8px] font-bold uppercase ${isToday ? 'text-[var(--color-primary)]' : 'text-white/40'}`}>
                    {h.date.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{weeklySummary.deliveries}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Trips</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold">{weeklySummary.activeDays}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Days</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold">34h</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-4 text-sm font-bold text-white shadow-glow transition hover:scale-105 active:scale-95">
          <Wallet size={18} /> Cash Out
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-white py-4 text-sm font-bold shadow-sm transition hover:bg-[var(--color-surface-variant)] active:scale-95">
          <Activity size={18} /> Analytics
        </button>
      </div>

      {/* ── Daily Breakdown ── */}
      <div className="mt-8">
        <h3 className="mb-4 font-display text-xl font-bold">Daily Breakdown</h3>
        <div className="space-y-3">
          {history.map((item, index) => (
            <div key={index} className="flex cursor-pointer items-center justify-between rounded-[1.5rem] bg-white border border-[var(--color-outline-variant)]/40 p-5 shadow-card transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${index === 0 ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold">{item.date}</h4>
                  <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">{item.deliveries} trips completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-display text-xl font-black">{formatCurrency(item.amount)}</p>
                <ChevronRight size={16} className="text-[var(--color-outline-variant)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
