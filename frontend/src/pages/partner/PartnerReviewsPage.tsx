import { useEffect, useState } from 'react';
import { Star, MessageSquare, Calendar, User, TrendingUp, Award, ChefHat } from 'lucide-react';
import { reviewService, type ReviewDTO } from '../../api/review';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { requireCurrentUserId } from '../../utils/session';

export default function PartnerReviewsPage() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurantsAndReviews();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadRestaurantReviews(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const loadRestaurantsAndReviews = async () => {
    setLoading(true);
    try {
      const ownerId = requireCurrentUserId();
      const restaurantData = await restaurantService.getRestaurantsByOwner(ownerId);
      setRestaurants(restaurantData);
      
      if (restaurantData.length > 0) {
        setSelectedRestaurant(restaurantData[0].id);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantReviews = async (restaurantId: number) => {
    try {
      const reviewData = await reviewService.getRestaurantReviews(restaurantId);
      setReviews(reviewData.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));
      
      const rating = await reviewService.getRestaurantRating(restaurantId);
      setAverageRating(rating);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
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
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.restaurantRating) {
        distribution[review.restaurantRating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="mx-auto max-w-6xl">
          <div className="skeleton h-12 w-64 rounded-2xl mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <ChefHat size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="font-display text-2xl font-black text-gray-900 mb-2">No Restaurants Found</h2>
          <p className="text-gray-600">Add a restaurant to start receiving reviews</p>
        </div>
      </div>
    );
  }

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;
  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl font-black mb-2">Restaurant Reviews</h1>
          <p className="text-purple-100">Customer feedback and ratings for your restaurants</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4">
        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <div className="mb-6 -mt-8">
            <div className="bg-white rounded-3xl shadow-lg p-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Restaurant</label>
              <select
                value={selectedRestaurant || ''}
                onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition"
              >
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 -mt-4">
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-yellow-100 p-3">
                <Star size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Average Rating</p>
                <p className="font-display text-3xl font-black text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
            {averageRating > 0 && renderStars(Math.round(averageRating))}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <MessageSquare size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Reviews</p>
                <p className="font-display text-3xl font-black text-gray-900">{totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <Award size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">5-Star Reviews</p>
                <p className="font-display text-3xl font-black text-gray-900">{distribution[5]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {totalReviews > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h3 className="font-display text-xl font-black text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = distribution[rating as keyof typeof distribution];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-bold text-gray-700">{rating}</span>
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="font-display text-xl font-black text-gray-900 mb-4">
            Customer Reviews for {selectedRestaurantData?.name}
          </h3>
          
          {totalReviews === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <MessageSquare size={48} className="text-gray-400" />
              </div>
              <h3 className="mb-2 font-display text-xl font-black text-gray-900">No reviews yet</h3>
              <p className="text-sm text-gray-600">Serve delicious food to receive customer feedback</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border-2 border-gray-200 p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-2">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {review.isAnonymous ? 'Anonymous Customer' : 'Customer'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.restaurantRating)}
                      <span className="text-sm font-bold text-gray-900">{review.restaurantRating}/5</span>
                    </div>
                  </div>
                  
                  {review.restaurantReview && (
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
                      "{review.restaurantReview}"
                    </p>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Order #{review.orderId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
