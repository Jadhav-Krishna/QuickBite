import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../api/restaurant';
import { reviewService, type ReviewDTO } from '../../api/review';

const formatReviewDate = (value?: string) => {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

export default function PartnerReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const restaurants = await restaurantService.getRestaurantsByOwner(user.userId);
        if (restaurants.length === 0) {
          setReviews([]);
          setRating(0);
          return;
        }

        const restaurantId = restaurants[0].id;
        const [reviewData, avgRating] = await Promise.all([
          reviewService.getRestaurantReviews(restaurantId),
          reviewService.getRestaurantRating(restaurantId),
        ]);

        setReviews(reviewData);
        setRating(avgRating || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user?.userId]);

  return (
    <div className="space-y-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-bold">Customer Reviews</h1>
          <p className="text-[var(--color-on-surface-variant)]">Read and respond to feedback.</p>
        </div>
        <Card className="flex items-center gap-4 !px-6 !py-3">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-[var(--color-primary-container)]">{rating.toFixed(1)}</p>
          </div>
          <div className="flex gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star key={value} size={20} fill={value <= Math.round(rating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <p className="ml-2 text-sm font-bold text-[var(--color-on-surface-variant)]">({reviews.length})</p>
        </Card>
      </header>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading ? <p className="text-[var(--color-on-surface-variant)]">Loading reviews...</p> : null}

      <div className="space-y-6">
        {reviews.map((review) => (
          <Card key={review.id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Order #{review.orderId}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < (review.restaurantRating || 0) ? 'currentColor' : 'none'}
                        className={index >= (review.restaurantRating || 0) ? 'text-gray-300' : ''}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-on-surface-variant)]">• {formatReviewDate(review.createdAt)}</span>
                </div>
              </div>
            </div>

            <p className="font-sans">{review.restaurantReview || 'No written review provided.'}</p>

            <div className="flex justify-end pt-4">
              <Button variant="outline" className="!px-4 !py-2 text-sm">Reply</Button>
            </div>
          </Card>
        ))}

        {!loading && reviews.length === 0 ? <p className="text-[var(--color-on-surface-variant)]">No reviews available yet.</p> : null}
      </div>
    </div>
  );
}
