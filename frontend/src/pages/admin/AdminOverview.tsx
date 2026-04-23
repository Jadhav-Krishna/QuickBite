import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bike, CreditCard, ShieldAlert, Store, Users } from 'lucide-react';
import { authService, type UserDTO } from '../../api/auth';
import { paymentService, type PaymentResponse } from '../../api/payment';
import { restaurantService } from '../../api/restaurant';

interface RecentPayment extends PaymentResponse {
  customerName: string;
}

interface SummaryState {
  totalUsers: number;
  activePartners: number;
  activeAgents: number;
  totalProcessed30d: number;
  pendingRestaurants: number;
  suspendedUsers: number;
  recentPayments: RecentPayment[];
}

const formatCurrency = (amount: number) =>
  `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const isAgent = (role: string) => role.toUpperCase().includes('AGENT');
const isCustomer = (role: string) => role.toUpperCase().includes('CUSTOMER');

export default function AdminOverview() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryState>({
    totalUsers: 0,
    activePartners: 0,
    activeAgents: 0,
    totalProcessed30d: 0,
    pendingRestaurants: 0,
    suspendedUsers: 0,
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSummary();
  }, []);

  const buildRecentPayments = (payments: PaymentResponse[], users: UserDTO[]) => {
    const userNameById = new Map<number, string>(
      users.map((user) => [user.userId, user.fullName]),
    );

    return payments.map((payment) => ({
      ...payment,
      customerName: userNameById.get(Number(payment.customerId)) || 'Customer',
    }));
  };

  const fetchRecentPaymentsFallback = async (users: UserDTO[]) => {
    const customers = users.filter((user) => isCustomer(user.role));

    const paymentResults = await Promise.allSettled(
      customers.map(async (customer) => {
        const payments = await paymentService.getCustomerPayments(customer.userId);
        return payments.map((payment) => ({
          ...payment,
          customerName: customer.fullName,
        }));
      }),
    );

    return paymentResults
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const [users, restaurants] = await Promise.all([
        authService.getAllUsers(),
        restaurantService.getAllRestaurantsForAdmin(),
      ]);

      let recentPayments: RecentPayment[] = [];

      try {
        const allPayments = await paymentService.getAllPayments();
        recentPayments = buildRecentPayments(allPayments, users).sort(
          (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
        );
      } catch {
        recentPayments = await fetchRecentPaymentsFallback(users);
      }
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalProcessed30d = recentPayments
        .filter((payment) => payment.status.toUpperCase() === 'SUCCESS')
        .filter((payment) => payment.createdAt && new Date(payment.createdAt).getTime() >= thirtyDaysAgo.getTime())
        .reduce((total, payment) => total + Number(payment.amount || 0), 0);

      setSummary({
        totalUsers: users.length,
        activePartners: restaurants.filter((restaurant) => restaurant.isApproved && restaurant.isActive).length,
        activeAgents: users.filter((user) => isAgent(user.role) && user.isActive).length,
        totalProcessed30d,
        pendingRestaurants: restaurants.filter((restaurant) => !restaurant.isApproved).length,
        suspendedUsers: users.filter((user) => !user.isActive).length,
        recentPayments: recentPayments.slice(0, 5),
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to load admin overview data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 rounded-3xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="h-96 rounded-3xl bg-slate-200" />
          <div className="h-96 rounded-3xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-12 animate-fade-up">
      <header>
        <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Platform Overview</h1>
        <p className="text-lg font-medium text-slate-500">Live operational signals sourced from the platform database.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Users</p>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-3xl font-black text-slate-900">{summary.totalUsers.toLocaleString()}</h2>
                <span className="flex items-center text-xs font-bold text-emerald-500">
                  <ArrowUpRight size={14} /> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Store size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Partners</p>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-3xl font-black text-slate-900">{summary.activePartners}</h2>
                <span className="flex items-center text-xs font-bold text-emerald-500">
                  <ArrowUpRight size={14} /> Approved
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <Bike size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Agents</p>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-3xl font-black text-slate-900">{summary.activeAgents}</h2>
                <span className="flex items-center text-xs font-bold text-emerald-500">
                  <ArrowUpRight size={14} /> Available
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 p-6 text-white shadow-lg shadow-indigo-600/20">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Processed 30d</p>
              <h2 className="font-display text-3xl font-black">{formatCurrency(summary.totalProcessed30d)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="mb-6 font-display text-2xl font-black text-slate-900">Operational Signals</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Store size={20} />
              </div>
              <div>
                <p className="font-display text-lg font-black text-amber-900">Pending Approvals</p>
                <p className="mt-1 text-sm text-amber-800">
                  <span className="font-bold">{summary.pendingRestaurants}</span> restaurants are waiting for review.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/approvals')}
                  className="mt-3 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-widest text-amber-700 transition hover:bg-amber-100"
                >
                  Review
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="font-display text-lg font-black text-rose-900">Suspended Users</p>
                <p className="mt-1 text-sm text-rose-800">
                  <span className="font-bold">{summary.suspendedUsers}</span> accounts are currently inactive.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="mt-3 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-100"
                >
                  Open Users
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-display text-2xl font-black text-slate-900">Recent Payments</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/payments')}
              className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 transition hover:bg-indigo-50"
            >
              View All
            </button>
          </div>

          {summary.recentPayments.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">No payment records available yet.</p>
          ) : (
            <div className="space-y-2">
              {summary.recentPayments.map((payment) => {
                const isSuccess = payment.status.toUpperCase() === 'SUCCESS';

                return (
                  <div
                    key={payment.paymentId}
                    className="flex items-center justify-between rounded-2xl border border-transparent p-4 transition hover:border-slate-100 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                          isSuccess
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                            : 'border-rose-100 bg-rose-50 text-rose-600'
                        }`}
                      >
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Order #{payment.orderId}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {payment.customerName} | {payment.paymentMethod.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-black text-slate-900">{formatCurrency(Number(payment.amount || 0))}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                          isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
