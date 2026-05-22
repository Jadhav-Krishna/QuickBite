import { useEffect, useState } from 'react';
import { Star, MessageSquare, Calendar, User, Filter, Search, TrendingUp, Award, Truck, ChefHat } from 'lucide-react';
import { reviewService, type ReviewDTO } from '../../api/review';
import { restaurantService, type Restaurant } from '../../api/restaurant';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewDTO[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'delivery'>('all');
  const [filterRating, setFilterRating] = useState<number>(0);

  useEffect(() => {
    loadAllReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchQuery, filterType, filterRating]);

  const loadAllReviews = async () => {
    setLoading(true);
    try {
      const reviewData = await reviewService.getAllReviews();
      setReviews(reviewData.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));

      // Load restaurant details
      const restaurantIds = [...new Set(reviewData.map(r => r.restaurantId))];
      const restaurantPromises = restaurantIds.map(id => restaurantService.getRestaurantById(id));
      const restaurantData = await Promise.all(restaurantPromises);
      const restaurantMap = new Map(restaurantData.map(r => [r.id, r]));
      setRestaurants(restaurantMap);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by type
    if (filterType === 'restaurant') {
      filtered = filtered.filter(r => r.restaurantRating > 0);
    } else if (filterType === 'delivery') {
      filtered = filtered.filter(r => r.deliveryRating && r.deliveryRating > 0);
    }

    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(r => {
        if (filterType === 'delivery') {
          return r.deliveryRating === filterRating;
        }
        return r.restaurantRating === filterRating;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => {
        const restaurant = restaurants.get(r.restaurantId);
        return (
          restaurant?.name.toLowerCase().includes(query) ||
          r.restaurantReview?.toLowerCase().includes(query) ||
          r.deliveryReview?.toLowerCase().includes(query) ||
          r.orderId.toString().includes(query)
        );
      });
    }

    setFilteredReviews(filtered);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unavailable';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getStats = () => {
    const totalReviews = reviews.length;
    const restaurantReviews = reviews.filter(r => r.restaurantRating > 0).length;
    const deliveryReviews = reviews.filter(r => r.deliveryRating && r.deliveryRating > 0).length;
    const avgRestaurantRating = reviews.reduce((sum, r) => sum + r.restaurantRating, 0) / (restaurantReviews || 1);
    const avgDeliveryRating = reviews.reduce((sum, r) => sum + (r.deliveryRating || 0), 0) / (deliveryReviews || 1);

    return {
      totalReviews,
      restaurantReviews,
      deliveryReviews,
      avgRestaurantRating,
      avgDeliveryRating,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="mx-auto max-w-7xl">
          <div className="skeleton h-12 w-64 rounded-2xl mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl font-black mb-2">Reviews Management</h1>
          <p className="text-indigo-100">Monitor and analyze all customer reviews</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 -mt-8">
          <div className="bg-white rounded-3xl shadow-lg p-4 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={20} className="text-blue-600" />
              <p className="text-xs font-semibold text-gray-600">Total</p>
            </div>
            <p className="font-display text-2xl font-black text-gray-900">{stats.totalReviews}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-4 border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <ChefHat size={20} className="text-purple-600" />
              <p className="text-xs font-semibold text-gray-600">Restaurant</p>
            </div>
            <p className="font-display text-2xl font-black text-gray-900">{stats.restaurantReviews}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-4 border-2 border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Truck size={20} className="text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Delivery</p>
            </div>
            <p className="font-display text-2xl font-black text-gray-900">{stats.deliveryReviews}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-4 border-2 border-yellow-100">
            <div className="flex items-center gap-2 mb-1">
              <Star size={20} className="text-yellow-600" />
              <p className="text-xs font-semibold text-gray-600">Avg Restaurant</p>
            </div>
            <p className="font-display text-2xl font-black text-gray-900">{stats.avgRestaurantRating.toFixed(1)}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-4 border-2 border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <Award size={20} className="text-orange-600" />
              <p className="text-xs font-semibold text-gray-600">Avg Delivery</p>
            </div>
            <p className="font-display text-2xl font-black text-gray-900">{stats.avgDeliveryRating.toFixed(1)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews, restaurants, orders..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
            >
              <option value="all">All Reviews</option>
              <option value="restaurant">Restaurant Only</option>
              <option value="delivery">Delivery Only</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-black text-gray-900">
              All Reviews ({filteredReviews.length})
            </h3>
          </div>
          
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-black text-gray-900">No reviews found</h3>
              <p className="text-sm text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const restaurant = restaurants.get(review.restaurantId);
                
                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border-2 border-gray-200 p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {review.isAnonymous ? 'Anonymous' : `Customer #${review.customerId}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar size={12} />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="mb-3 p-3 bg-purple-50 rounded-xl">
                      <p className="text-xs font-semibold text-purple-600 mb-1">Restaurant</p>
                      <p className="font-bold text-gray-900">{restaurant?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Order #{review.orderId}</p>
                    </div>

                    {/* Restaurant Review */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-600">Restaurant Rating</p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.restaurantRating)}
                          <span className="text-sm font-bold text-gray-900">{review.restaurantRating}/5</span>
                        </div>
                      </div>
                      {review.restaurantReview && (
                        <p className="text-sm text-gray-700">"{review.restaurantReview}"</p>
                      )}
                    </div>

                    {/* Delivery Review */}
                    {review.deliveryRating && (
                      <div className="p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-green-600">Delivery Rating</p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.deliveryRating)}
                            <span className="text-sm font-bold text-gray-900">{review.deliveryRating}/5</span>
                          </div>
                        </div>
                        {review.deliveryReview && (
                          <p className="text-sm text-gray-700">"{review.deliveryReview}"</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
