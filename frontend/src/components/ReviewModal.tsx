import { useState } from 'react';
import { X, Star, Send, User, Truck } from 'lucide-react';
import { reviewService, type CreateReviewRequest } from '../api/review';
import { type OrderDTO } from '../api/order';

interface ReviewModalProps {
  order: OrderDTO;
  customerId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ order, customerId, onClose, onSuccess }: ReviewModalProps) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantReview, setRestaurantReview] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryReview, setDeliveryReview] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (restaurantRating === 0) {
      setError('Please rate the restaurant');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewData: CreateReviewRequest = {
        orderId: order.id,
        customerId,
        restaurantId: order.restaurantId,
        restaurantRating,
        restaurantReview: restaurantReview.trim() || undefined,
        deliveryRating: deliveryRating > 0 ? deliveryRating : undefined,
        deliveryReview: deliveryReview.trim() || undefined,
        deliveryAgentId: order.deliveryAgentId || undefined,
        isAnonymous,
      };

      await reviewService.createReview(reviewData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 animate-fade-in">
      <div className="relative max-w-4xl w-full rounded-2xl sm:rounded-3xl bg-white shadow-2xl flex flex-col mb-20 sm:mb-0">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-3 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg sm:text-2xl font-black text-white">Rate Your Experience</h2>
            <p className="text-xs sm:text-sm text-red-100 mt-1">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-3">
          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Review Cards - stacked on mobile, side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Review */}
            <div className="rounded-2xl border-2 border-gray-200 p-3 sm:p-5 space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-100 p-2">
                  <User size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-display text-sm sm:text-lg font-black text-gray-900">Restaurant Experience</h3>
                  <p className="text-xs text-gray-600">How was the food quality and taste?</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Rating <span className="text-red-600">*</span>
                </label>
                {renderStars(restaurantRating, setRestaurantRating)}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Review (Optional)</label>
                <textarea
                  value={restaurantReview}
                  onChange={(e) => setRestaurantReview(e.target.value)}
                  placeholder="Share your experience with the food..."
                  rows={2}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Delivery Review */}
            {order.deliveryAgentId ? (
              <div className="rounded-2xl border-2 border-gray-200 p-3 sm:p-5 space-y-2 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Truck size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm sm:text-lg font-black text-gray-900">Delivery Experience</h3>
                    <p className="text-xs text-gray-600">How was the delivery service?</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rating (Optional)</label>
                  {renderStars(deliveryRating, setDeliveryRating)}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Review (Optional)</label>
                  <textarea
                    value={deliveryReview}
                    onChange={(e) => setDeliveryReview(e.target.value)}
                    placeholder="Share your experience with the delivery..."
                    rows={2}
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition resize-none"
                  />
                </div>
              </div>
            ) : <div />}
          </div>

          {/* Anonymous Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-sm font-semibold text-gray-700">Post review anonymously</span>
          </label>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || restaurantRating === 0}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-2xl font-bold hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
