import { useEffect, useState } from 'react';
import { Star, Search, User, Store, Bike, MessageSquare, Calendar } from 'lucide-react';
import { reviewService, type ReviewDTO } from '../../api/review';
import { authService, type UserDTO } from '../../api/auth';
import { restaurantService, type Restaurant } from '../../api/restaurant';

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [users, setUsers] = useState<Map<number, UserDTO>>(new Map());
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'restaurant' | 'delivery'>('all');

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, usersData, restaurantsData] = await Promise.all([
        reviewService.getAllReviews(),
        authService.getAllUsers(),
        restaurantService.getAllRestaurantsForAdmin(),
      ]);

      setReviews(reviewsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setUsers(new Map(usersData.map(u => [u.userId, u])));
      setRestaurants(new Map(restaurantsData.map(r => [r.id, r])));
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'restaurant' && !review.restaurantReview) return false;
    if (filter === 'delivery' && !review.deliveryReview) return false;
    
    if (search) {
      const query = search.toLowerCase();
      const customer = users.get(review.customerId);
      const restaurant = restaurants.get(review.restaurantId);
      const agent = review.deliveryAgentId ? users.get(review.deliveryAgentId) : null;
      
      return (
        customer?.fullName.toLowerCase().includes(query) ||
        restaurant?.name.toLowerCase().includes(query) ||
        agent?.fullName.toLowerCase().includes(query) ||
        review.restaurantReview?.toLowerCase().includes(query) ||
        review.deliveryReview?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="h-[600px] rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] space-y-8 animate-fade-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Review Management</h1>
          <p className="font-medium text-slate-500">Monitor feedback for restaurants and delivery agents</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              filter === 'all'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('restaurant')}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              filter === 'restaurant'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setFilter('delivery')}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              filter === 'delivery'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50'
            }`}
          >
            Delivery
          </button>
        </div>
      </header>

      <div className="relative group">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, restaurant, agent, or review content..."
          className="w-full rounded-full border border-slate-200 bg-white px-12 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-red-300 focus:ring-4 focus:ring-red-500/10"
        />
      </div>

      <div className="grid gap-6">
        {filteredReviews.map((review) => {
          const customer = users.get(review.customerId);
          const restaurant = restaurants.get(review.restaurantId);
          const agent = review.deliveryAgentId ? users.get(review.deliveryAgentId) : null;

          return (
            <div key={review.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 font-display text-xl font-black text-white">
                    {customer?.fullName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{customer?.fullName || 'Unknown Customer'}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar size={14} /> {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-600">
                  Order #{review.orderId}
                </span>
              </div>

              {review.restaurantReview && (
                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <Store size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{restaurant?.name || 'Restaurant'}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.restaurantRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                            />
                          ))}
                          <span className="ml-1 text-sm font-bold text-amber-600">{review.restaurantRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MessageSquare size={16} className="mt-1 text-amber-500 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{review.restaurantReview}</p>
                  </div>
                </div>
              )}

              {review.deliveryReview && agent && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Bike size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{agent.fullName}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < (review.deliveryRating || 0) ? 'fill-emerald-400 text-emerald-400' : 'text-slate-300'}
                            />
                          ))}
                          <span className="ml-1 text-sm font-bold text-emerald-600">{review.deliveryRating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MessageSquare size={16} className="mt-1 text-emerald-500 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{review.deliveryReview}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <Star size={32} className="opacity-50" />
            </div>
            <p className="font-display text-xl font-black text-slate-700">No reviews found</p>
            <p className="mt-1 text-sm font-medium">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
