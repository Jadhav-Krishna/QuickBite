import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CreditCard, Plus, ArrowUpRight } from 'lucide-react';
import { paymentService, type PaymentResponse, type WalletResponse, type WalletStatementDTO } from '../../api/payment';
import { requireCurrentUserId } from '../../utils/session';

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [statements, setStatements] = useState<WalletStatementDTO[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('500');

  const loadWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const customerId = requireCurrentUserId();
      const [walletData, statementData, paymentData] = await Promise.all([
        paymentService.getWalletBalance(customerId),
        paymentService.getWalletStatements(customerId),
        paymentService.getCustomerPayments(customerId),
      ]);
      setWallet(walletData);
      setStatements(statementData);
      setPayments(paymentData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load wallet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadWallet);
  }, []);

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid top-up amount.');
      return;
    }

    setError(null);
    try {
      const customerId = requireCurrentUserId();
      const updated = await paymentService.depositToWallet(customerId, amount);
      setWallet(updated);
      await loadWallet();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Top-up failed.');
    }
  };

  const formattedBalance = useMemo(() => Number(wallet?.balance || 0).toFixed(2), [wallet]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="mb-2 font-display text-4xl font-bold">My Wallet</h1>
        <p className="text-[var(--color-on-surface-variant)]">Manage your QuickBite balance and transactions.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-[var(--color-on-surface-variant)]">Loading wallet...</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary-container)] p-8 text-white">
              <div className="absolute right-0 top-0 p-8 opacity-20">
                <CreditCard size={120} />
              </div>
              <div className="relative z-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/80">QuickBite Balance</p>
                <h2 className="mb-6 font-display text-5xl font-bold">₹ {formattedBalance}</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={topUpAmount}
                    onChange={(event) => setTopUpAmount(event.target.value)}
                    className="w-28 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white placeholder-white/70 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTopUp}
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:scale-105"
                  >
                    <Plus size={16} /> Top Up
                  </button>
                </div>
              </div>
            </Card>

            <Card className="flex flex-col justify-center">
              <h3 className="mb-4 font-serif text-xl font-bold">Recent Payment Methods</h3>
              <div className="space-y-3">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.paymentId} className="flex items-center justify-between rounded-2xl border bg-[var(--color-surface-container-highest)] p-4">
                    <div>
                      <p className="font-bold">{payment.paymentMethod.replace('_', ' ')}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">{payment.status}</p>
                    </div>
                    <span className="font-semibold">₹ {Number(payment.amount).toFixed(2)}</span>
                  </div>
                ))}
                {payments.length === 0 ? (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No payment records found yet.</p>
                ) : null}
                <Button variant="outline" fullWidth className="border-dashed">Add Payment Method</Button>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="mb-6 font-serif text-2xl font-bold">Recent Transactions</h3>
            <Card className="!p-0 overflow-hidden">
              <div className="divide-y divide-[var(--color-surface-variant)]">
                {statements.map((tx) => {
                  const isCredit = tx.type.toUpperCase().includes('DEPOSIT') || tx.amount > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-5 transition-colors hover:bg-[var(--color-surface-container-high)]">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-[var(--color-surface-container-highest)]'}`}>
                          {isCredit ? <ArrowUpRight size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold">{tx.description || tx.type}</h4>
                          <p className="text-sm text-[var(--color-on-surface-variant)]">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${isCredit ? 'text-emerald-600' : ''}`}>₹ {Number(tx.amount).toFixed(2)}</p>
                    </div>
                  );
                })}

                {statements.length === 0 ? (
                  <div className="p-5 text-[var(--color-on-surface-variant)]">No wallet transactions yet.</div>
                ) : null}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
