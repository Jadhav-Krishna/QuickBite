import { useCallback, useEffect, useMemo, useState } from 'react';
import { TrendingUp, Banknote, Calendar, ChevronRight, Activity, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../api/delivery';
import { orderService, type OrderDTO } from '../../api/order';

const EARNING_RATE = 0.12;
const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const getDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default function AgentEarnings() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEarnings = useCallback(async () => {
    if (!user?.userId) { setLoading(false); return; }
    try {
      setError(null);
      const resolved = await deliveryService.resolveAgentForUser(user.userId);
      const [agentProfile, agentOrders] = await Promise.all([
        deliveryService.getAgentEarnings(resolved.agentId).catch(() => resolved.agent),
        orderService.getAgentOrders(resolved.agentId).catch(() => []),
      ]);
      setTotalDeliveries(agentProfile.totalDeliveries || 0);
      setOrders(agentOrders.filter((o) => o.status === 'DELIVERED'));
    } catch (err: any) {
      setError(err?.message || 'Unable to load earnings.');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => { void loadEarnings(); }, [loadEarnings]);

  const history = useMemo(() => {
    const byDay = new Map<string, { date: Date; label: string; deliveries: number; amount: number }>();
    orders.forEach((order) => {
      const d = new Date(order.createdAt || order.updatedAt || Date.now());
      const key = d.toISOString().slice(0, 10);
      const existing = byDay.get(key) || { date: d, label: getDayLabel(d.toISOString()), deliveries: 0, amount: 0 };
      existing.deliveries += 1;
      existing.amount += (order.finalAmount || order.totalAmount || 0) * EARNING_RATE;
      byDay.set(key, existing);
    });
    return Array.from(byDay.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 7);
  }, [orders]);

  const weeklySummary = useMemo(() => ({
    deliveries: history.reduce((s, h) => s + h.deliveries, 0),
    estimatedPay: history.reduce((s, h) => s + h.amount, 0),
    activeDays: history.length,
  }), [history]);

  const maxAmount = Math.max(...history.map((h) => h.amount), 1);

  if (loading) {
    return (
      <div className="space-y-6 pt-4 animate-pulse">
        <div className="h-10 w-48 skeleton rounded-full" />
        <div className="h-64 skeleton rounded-[2.5rem]" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 skeleton rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-10 animate-fade-up">
      <header className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl font-black text-slate-900">Earnings</h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Banknote size={20} />
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>
      ) : null}

      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/30 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">This Week's Pay</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 className="font-display text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              {formatCurrency(weeklySummary.estimatedPay)}
            </h2>
            <div className="mb-2 flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
              <TrendingUp size={12} /> Live
            </div>
          </div>

          <div className="mt-8 flex h-24 items-end justify-between gap-2 border-b border-white/10 pb-2">
            {[...history].reverse().map((h, i) => {
              const heightPct = (h.amount / maxAmount) * 100;
              const isToday = i === history.length - 1;
              return (
                <div key={h.label + i} className="flex w-full flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-8 hidden group-hover:block rounded bg-white px-2 py-1 text-[10px] font-bold text-black">
                      {formatCurrency(h.amount)}
                    </div>
                    <div
                      className={`w-full max-w-[12px] rounded-t-full transition-all duration-1000 ease-out ${isToday ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-white/20 hover:bg-white/40'}`}
                      style={{ height: `${heightPct}%`, minHeight: '10%' }}
                    />
                  </div>
                  <span className={`text-[8px] font-bold uppercase ${isToday ? 'text-red-400' : 'text-white/40'}`}>
                    {h.label.slice(0, 3)}
                  </span>
                </div>
              );
            })}
            {history.length === 0 ? (
              <p className="w-full text-center text-xs text-white/40">No deliveries yet</p>
            ) : null}
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
              <p className="text-xl font-bold">{totalDeliveries}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lifetime</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:scale-105 active:scale-95">
          <Wallet size={18} /> Cash Out
        </button>
        <button onClick={() => void loadEarnings()} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95">
          <Activity size={18} /> Refresh
        </button>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 font-display text-xl font-bold text-slate-900">Daily Breakdown</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No delivered orders yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.label + index} className="flex cursor-pointer items-center justify-between rounded-[1.5rem] bg-white border border-slate-200 p-5 shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${index === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-slate-900">{item.label}</h4>
                    <p className="text-xs font-semibold text-slate-500">{item.deliveries} trips completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-xl font-black text-slate-900">{formatCurrency(item.amount)}</p>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
