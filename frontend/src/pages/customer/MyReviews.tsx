import { useEffect, useState } from 'react';
import { Star, MessageSquare, Calendar, User, Truck } from 'lucide-react';
import { reviewService, type ReviewDTO } from '../../api/review';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { requireCurrentUserId } from '../../utils/session';

export default function MyReviews() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [loading, setLoading] = useState(true);
  const customerId = requireCurrentUserId();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getCustomerReviews(customerId);
      setReviews(data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));

      // Load restaurant details
      const restaurantIds = [...new Set(data.map(r => r.restaurantId))];
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="skeleton h-12 w-64 rounded-2xl mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-black text-gray-900">My Reviews</h1>
              <p className="text-sm text-gray-600 mt-1">{reviews.length} reviews posted</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <MessageSquare size={48} className="text-gray-400" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-black text-gray-900">No reviews yet</h3>
            <p className="text-sm text-gray-600">Order food and share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => {
              const restaurant = restaurants.get(review.restaurantId);

              return (
                <div
                  key={review.id}
                  className="rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg overflow-hidden"
                >
                  {/* Restaurant Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {restaurant?.imageUrl ? (
                        <img
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-black text-gray-900">
                          {restaurant?.name || 'Restaurant'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Restaurant Review */}
                    <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full bg-red-100 p-2">
                          <User size={18} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">Restaurant Experience</p>
                          {renderStars(review.restaurantRating)}
                        </div>
                      </div>
                      {review.restaurantReview && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          "{review.restaurantReview}"
                        </p>
                      )}
                    </div>

                    {/* Delivery Review */}
                    {review.deliveryRating && (
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="rounded-full bg-blue-100 p-2">
                            <Truck size={18} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700">Delivery Experience</p>
                            {renderStars(review.deliveryRating)}
                          </div>
                        </div>
                        {review.deliveryReview && (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            "{review.deliveryReview}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Anonymous Badge */}
                    {review.isAnonymous && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="rounded-full bg-gray-100 px-3 py-1 font-semibold">
                          Posted Anonymously
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
