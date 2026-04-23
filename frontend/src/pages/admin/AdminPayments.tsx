import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Download, RefreshCcw, ShieldAlert, Wallet } from 'lucide-react';
import { authService, type UserDTO } from '../../api/auth';
import { paymentService, type PaymentResponse } from '../../api/payment';

interface PaymentRow extends PaymentResponse {
  customerName: string;
  customerEmail: string;
}

const formatCurrency = (amount: number) =>
  `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [walletExposure, setWalletExposure] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadPayments();
  }, []);

  const buildPaymentRows = (
    sourcePayments: PaymentResponse[],
    users: UserDTO[],
  ): PaymentRow[] => {
    const userDirectory = new Map(
      users.map((user) => [user.userId, { name: user.fullName, email: user.email }]),
    );

    return sourcePayments.map((payment) => {
      const user = userDirectory.get(Number(payment.customerId));

      return {
        ...payment,
        customerName: user?.name || 'Customer',
        customerEmail: user?.email || 'N/A',
      };
    });
  };

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const users = await authService.getAllUsers();
      const customers = users.filter((user) => user.role.toUpperCase().includes('CUSTOMER'));

      try {
        const allPayments = await paymentService.getAllPayments();
        const paymentRows = buildPaymentRows(allPayments, users).sort(
          (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
        );

        const walletBalances = await Promise.allSettled(
          customers.map((customer) =>
            paymentService
              .getWalletBalance(customer.userId)
              .then((wallet) => Number(wallet.balance || 0))
              .catch(() => 0),
          ),
        );

        const nextWalletExposure = walletBalances.reduce(
          (sum, result) => (result.status === 'fulfilled' ? sum + result.value : sum),
          0,
        );

        setWalletExposure(nextWalletExposure);
        setPayments(paymentRows);
        return;
      } catch {
        // Fallback to per-customer fan-out if aggregated endpoint isn't available.
      }

      const results = await Promise.allSettled(
        customers.map(async (customer) => {
          const [customerPayments, walletBalance] = await Promise.all([
            paymentService.getCustomerPayments(customer.userId),
            paymentService
              .getWalletBalance(customer.userId)
              .then((wallet) => Number(wallet.balance || 0))
              .catch(() => 0),
          ]);

          return {
            walletBalance,
            rows: customerPayments.map((payment) => ({
              ...payment,
              customerName: customer.fullName,
              customerEmail: customer.email,
            })),
          };
        }),
      );

      let nextWalletExposure = 0;
      const nextPayments = results.flatMap((result) => {
        if (result.status !== 'fulfilled') {
          return [];
        }

        nextWalletExposure += result.value.walletBalance;
        return result.value.rows;
      });

      setWalletExposure(nextWalletExposure);
      setPayments(
        nextPayments.sort(
          (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
        ),
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to load payment activity.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rows = [...payments].sort(
      (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
    );

    const last30Days = rows.filter((payment) => {
      if (!payment.createdAt) return false;
      return new Date(payment.createdAt).getTime() >= thirtyDaysAgo.getTime();
    });

    const successfulPayments = last30Days.filter((payment) => payment.status.toUpperCase() === 'SUCCESS');
    const refundedPayments = last30Days.filter((payment) => payment.status.toUpperCase() === 'REFUNDED');
    const failedPayments = last30Days.filter((payment) => payment.status.toUpperCase() === 'FAILED');

    return {
      rows,
      totalProcessed30d: successfulPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      successfulCount30d: successfulPayments.length,
      refunded30d: refundedPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      failedCount30d: failedPayments.length,
    };
  }, [payments]);

  const exportCsv = () => {
    const rows = [
      ['Payment ID', 'Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Method', 'Date'],
      ...summary.rows.map((payment) => [
        `"${payment.paymentId}"`,
        `"${payment.orderId}"`,
        `"${payment.customerName}"`,
        `"${payment.customerEmail}"`,
        `"${payment.amount}"`,
        `"${payment.status}"`,
        `"${payment.paymentMethod}"`,
        `"${payment.createdAt ? new Date(payment.createdAt).toLocaleString() : ''}"`,
      ]),
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
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
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-3xl bg-slate-200" />
          ))}
        </div>
        <div className="h-[500px] rounded-3xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] space-y-8 animate-fade-up">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Financial Ledger</h1>
          <p className="font-medium text-slate-500">Payment volume, refunds, wallet exposure, and transaction history from live records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadPayments()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={summary.rows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <ShieldAlert size={18} /> {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 p-6 text-white shadow-lg shadow-indigo-600/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/75">Gross Volume 30d</p>
          <h2 className="mt-2 font-display text-4xl font-black">{formatCurrency(summary.totalProcessed30d)}</h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Successful Payments 30d</p>
          <h2 className="mt-2 font-display text-3xl font-black text-slate-900">{summary.successfulCount30d}</h2>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Refunded Amount 30d</p>
          <h2 className="mt-2 font-display text-3xl font-black text-slate-900">{formatCurrency(summary.refunded30d)}</h2>
          <p className="mt-3 text-xs font-bold text-slate-400">{summary.failedCount30d} failed payments in the same window</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Wallet size={14} className="text-emerald-500" /> Wallet Exposure
          </div>
          <h2 className="mt-2 font-display text-3xl font-black text-slate-900">{formatCurrency(walletExposure)}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6">
          <h3 className="font-display text-xl font-black text-slate-900">Transaction History</h3>
        </div>

        {summary.rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <CreditCard size={48} className="mb-4 opacity-20" />
            <p className="font-display text-xl font-black text-slate-700">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.rows.map((payment) => {
                  const isSuccess = payment.status.toUpperCase() === 'SUCCESS';
                  const isRefund = payment.status.toUpperCase() === 'REFUNDED';

                  return (
                    <tr key={payment.paymentId} className="transition hover:bg-slate-50">
                      <td className="px-8 py-4">
                        <p className="font-mono text-sm font-bold text-slate-700">#{payment.paymentId}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{payment.customerName}</p>
                        <p className="text-xs font-semibold text-slate-500">{payment.customerEmail}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                          {payment.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <p className="font-display text-lg font-black text-slate-900">{formatCurrency(Number(payment.amount || 0))}</p>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span
                          className={`inline-flex justify-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                            isSuccess
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : isRefund
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-rose-200 bg-rose-50 text-rose-700'
                          }`}
                        >
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
