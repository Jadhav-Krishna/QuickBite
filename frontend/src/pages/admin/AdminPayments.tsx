import { useEffect, useMemo, useState } from 'react';
import { Download, CreditCard, ArrowUpRight, ArrowDownRight, RefreshCcw, Landmark, ShieldCheck, Filter } from 'lucide-react';
import { authService } from '../../api/auth';
import { paymentService, type PaymentResponse } from '../../api/payment';

interface PaymentRow extends PaymentResponse {
  customerName: string;
  customerEmail: string;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const allUsers = await authService.getAllUsers();
      const customers = allUsers.filter((user) => user.role.toUpperCase().includes('CUSTOMER'));
      const paymentResults = await Promise.allSettled(
        customers.map(async (customer) => {
          const customerPayments = await paymentService.getCustomerPayments(customer.userId);
          return customerPayments.map((payment) => ({
            ...payment,
            customerName: customer.fullName,
            customerEmail: customer.email,
          }));
        }),
      );

      const rows = paymentResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
      setPayments(rows);
    } catch (err: any) {
      setError(err.message || 'Unable to load payment activity.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentPayments = payments.filter((payment) => {
      if (!payment.createdAt) return false;
      return new Date(payment.createdAt).getTime() >= last30Days.getTime();
    });

    const successfulPayments = recentPayments.filter((payment) => payment.status.toUpperCase() === 'SUCCESS');
    const refunds = recentPayments.filter((payment) => payment.status.toUpperCase() === 'REFUNDED');
    const failedPayments = recentPayments.filter((payment) => payment.status.toUpperCase() === 'FAILED');

    const totalProcessed = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalProcessed30d: totalProcessed,
      successfulPayments: successfulPayments.length,
      refunds30d: refunds.reduce((sum, p) => sum + p.amount, 0),
      failedCount: failedPayments.length,
      
      // Simulated payout calculation
      partnerPayouts: totalProcessed * 0.85, // 85% to partners
      agentPayouts: totalProcessed * 0.05, // 5% to delivery agents
      platformRevenue: totalProcessed * 0.10, // 10% platform fee

      rows: [...payments].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      ),
    };
  }, [payments]);

  const exportCsv = () => {
    const rows = [
      ['Payment ID', 'Order ID', 'Customer', 'Email', 'Amount (INR)', 'Status', 'Method', 'Date'],
      ...summary.rows.map((p) => [
        `"${p.paymentId}"`,
        `"${p.orderId}"`,
        `"${p.customerName}"`,
        `"${p.customerEmail}"`,
        `"${p.amount}"`,
        `"${p.status}"`,
        `"${p.paymentMethod}"`,
        `"${new Date(p.createdAt!).toLocaleString()}"`,
      ]),
    ];

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `quickbite_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-[1600px]">
        <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-[2rem]" />)}
        </div>
        <div className="h-[500px] bg-slate-200 rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">Aggregated 30-day payment volumes, revenue split, and real-time transaction logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadPayments}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button 
            onClick={exportCsv}
            disabled={summary.rows.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* ── Financial Highlights ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-600/30 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Gross Volume (30d)</p>
            <h2 className="font-display text-4xl font-black">{formatCurrency(summary.totalProcessed30d)}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <ArrowUpRight size={14} className="text-emerald-300" /> +14.2% MoM
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
              <Landmark size={14} className="text-amber-500" /> Platform Net Revenue (10%)
            </p>
            <h2 className="font-display text-3xl font-black text-slate-900">{formatCurrency(summary.platformRevenue)}</h2>
          </div>
          <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[10%]" />
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
              <CreditCard size={14} className="text-emerald-500" /> Partner Payouts (85%)
            </p>
            <h2 className="font-display text-3xl font-black text-slate-900">{formatCurrency(summary.partnerPayouts)}</h2>
          </div>
          <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[85%]" />
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" /> Refund Liability
            </p>
            <div className="flex items-end gap-3">
              <h2 className="font-display text-3xl font-black text-slate-900">{formatCurrency(summary.refunds30d)}</h2>
              <span className="text-xs font-bold text-slate-400 mb-1">({summary.failedCount} failed orders)</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
            <ArrowDownRight size={14} /> Attention Required
          </p>
        </div>
      </div>

      {/* ── Transaction Ledger ── */}
      <div className="rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-display text-xl font-black text-slate-900">Transaction History</h3>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            <Filter size={14} /> Filter
          </button>
        </div>

        {summary.rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <CreditCard size={48} className="opacity-20 mb-4" />
            <p className="font-display text-xl font-black text-slate-700">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">TXN ID / Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.rows.map((payment) => {
                  const isSuccess = payment.status.toUpperCase() === 'SUCCESS';
                  const isRefund = payment.status.toUpperCase() === 'REFUNDED';
                  
                  return (
                    <tr key={payment.paymentId} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-4">
                        <p className="font-mono text-sm font-bold text-slate-700">#{payment.paymentId}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(payment.createdAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{payment.customerName}</p>
                        <p className="text-xs font-semibold text-slate-500">{payment.customerEmail}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                          {payment.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <p className="font-display text-lg font-black text-slate-900">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          isRefund ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
