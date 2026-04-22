import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { orderService, type OrderDTO } from '../../api/order';
import { requireCurrentUserId } from '../../utils/session';

const formatOrderDate = (value?: string) => {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const customerId = requireCurrentUserId();
        const data = await orderService.getCustomerOrders(customerId);
        setOrders(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load order history.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-2 font-display text-4xl font-bold">Order History</h1>
          <p className="text-[var(--color-on-surface-variant)]">Review your previous orders.</p>
        </div>
        <Link to="/profile">
          <Button variant="outline" className="!px-4 !py-2 !text-sm">Back to Profile</Button>
        </Link>
      </header>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-[var(--color-on-surface-variant)]">Loading orders...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
                <p className="text-sm text-[var(--color-on-surface-variant)]">{formatOrderDate(order.createdAt)}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">{order.items?.map((item) => `${item.quantity}x ${item.itemName}`).join(', ')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[var(--color-primary-container)]">Rs {order.finalAmount?.toFixed(2)}</p>
                <span className="inline-flex rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {order.status}
                </span>
              </div>
            </Card>
          ))}

          {orders.length === 0 ? (
            <Card>
              <p className="text-[var(--color-on-surface-variant)]">No orders yet. Start exploring restaurants.</p>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
