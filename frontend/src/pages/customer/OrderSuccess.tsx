import { Link, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface SuccessState {
  orderNumber?: string;
  amount?: number;
}

export default function OrderSuccess() {
  const location = useLocation();
  const state = (location.state as SuccessState | null) || null;
  const orderNumber = state?.orderNumber || 'Pending';
  const amount = state?.amount ?? 0;

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="relative w-full max-w-md overflow-hidden p-8 text-center md:p-12">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--color-primary-container)]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 size={48} />
          </div>

          <div>
            <h1 className="mb-2 font-display text-4xl font-bold text-[var(--color-on-surface)]">Order Placed!</h1>
            <p className="text-lg text-[var(--color-on-surface-variant)]">Your payment of Rs {amount.toFixed(2)} was successful.</p>
          </div>

          <div className="mb-4 w-full rounded-2xl bg-[var(--color-surface-container-highest)] p-4">
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Order Number</p>
            <p className="font-mono text-xl font-bold text-[var(--color-primary-container)]">#{orderNumber}</p>
          </div>

          <div className="w-full space-y-3">
            <Link to={`/tracking/${orderNumber}`} className="w-full">
              <Button variant="primary" fullWidth>Track Delivery</Button>
            </Link>
            <Link to="/restaurants" className="w-full">
              <Button variant="ghost" fullWidth>Back to Home</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}