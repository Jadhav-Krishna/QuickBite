import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../api/restaurant';
import { orderService, type OrderDTO } from '../../api/order';

const getOrderCreatedDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function PartnerAnalytics() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const restaurants = await restaurantService.getRestaurantsByOwner(user.userId);
        if (restaurants.length === 0) {
          setOrders([]);
          return;
        }

        const data = await orderService.getRestaurantOrders(restaurants[0].id);
        setOrders(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user?.userId]);

  const metrics = useMemo(() => {
    const now = new Date();
    const monthOrders = orders.filter((order) => {
      const created = getOrderCreatedDate(order.createdAt);
      if (!created) {
        return false;
      }

      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });

    const deliveredOrders = monthOrders.filter((order) => order.status === 'DELIVERED');
    const totalSales = deliveredOrders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || 0), 0);
    const avgOrderValue = deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0;

    const itemMap = new Map<string, { count: number; revenue: number }>();
    deliveredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const current = itemMap.get(item.itemName) || { count: 0, revenue: 0 };
        current.count += item.quantity;
        current.revenue += item.quantity * item.price;
        itemMap.set(item.itemName, current);
      });
    });

    const topItems = Array.from(itemMap.entries())
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSales,
      totalOrders: monthOrders.length,
      avgOrderValue,
      deliveredOrders: deliveredOrders.length,
      topItems,
    };
  }, [orders]);

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="mb-2 font-display text-4xl font-bold">Analytics</h1>
        <p className="text-[var(--color-on-surface-variant)]">Performance based on live order data.</p>
      </header>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading ? <p className="text-[var(--color-on-surface-variant)]">Loading analytics...</p> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Total Sales (Month)</p>
          <h2 className="font-display text-4xl text-[var(--color-primary-container)]">₹{metrics.totalSales.toFixed(0)}</h2>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Total Orders</p>
          <h2 className="font-display text-4xl">{metrics.totalOrders}</h2>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Delivered Orders</p>
          <h2 className="font-display text-4xl">{metrics.deliveredOrders}</h2>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Avg Order Value</p>
          <h2 className="font-display text-4xl">₹{metrics.avgOrderValue.toFixed(0)}</h2>
        </Card>
      </div>

      <Card>
        <h3 className="mb-6 font-serif text-xl font-bold">Top Selling Items</h3>
        <div className="space-y-4">
          {metrics.topItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between border-b border-[var(--color-surface-variant)] pb-3 last:border-0">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">{item.count} sold</p>
              </div>
              <p className="font-bold text-[var(--color-primary-container)]">₹{item.revenue.toFixed(0)}</p>
            </div>
          ))}
          {!loading && metrics.topItems.length === 0 ? <p className="text-[var(--color-on-surface-variant)]">Not enough delivered orders yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
