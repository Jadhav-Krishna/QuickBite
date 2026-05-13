import { useEffect, useState } from 'react';
import { Star, MessageSquare, ChefHat, Truck, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewService, type ReviewDTO } from '../../api/review';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { requireCurrentUserId } from '../../utils/session';

export default function MyReviews() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const customerId = requireCurrentUserId();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPerPage(1);
      } else if (window.innerWidth < 1024) {
        setPerPage(2);
      } else {
        setPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getCustomerReviews(customerId);
      const sorted = data.sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      setReviews(sorted);
      const ids = [...new Set(data.map(r => r.restaurantId))];
      const rData = await Promise.all(ids.map(id => restaurantService.getRestaurantById(id)));
      setRestaurants(new Map(rData.map(r => [r.id, r])));
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.restaurantRating, 0) / reviews.length).toFixed(1)
    : '—';

  const totalPages = Math.ceil(reviews.length / perPage);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const visible = reviews.slice(safePage * perPage, safePage * perPage + perPage);

  // Auto-correct page if out of bounds due to resize
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="fixed inset-0 top-14 bottom-20 flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-[var(--color-on-surface-variant)]">Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (reviews.length === 0) {
    return (
      <div className="fixed inset-0 top-14 bottom-20 flex flex-col items-center justify-center bg-[var(--color-surface)] px-6">
        <div className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center mb-3">
          <MessageSquare size={28} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="font-display text-lg font-black text-[var(--color-on-surface)] mb-1">No reviews yet</h2>
        <p className="text-xs text-[var(--color-on-surface-variant)] text-center max-w-xs">
          Order food and share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-14 bottom-20 flex flex-col bg-[var(--color-surface)] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 md:px-6">
        <div>
          <h1 className="font-display text-lg font-black text-gradient leading-none">My Reviews</h1>
          <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-0.5">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-0.5">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-black text-yellow-700">{avgRating} avg</span>
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-2 md:px-6 content-start">
        {visible.map((review) => {
          const r = restaurants.get(review.restaurantId);
          const overall = ((review.restaurantRating + (review.deliveryRating || review.restaurantRating)) / 2).toFixed(1);
          return (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-[var(--color-outline-variant)] shadow-card overflow-hidden flex flex-col"
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] px-3 py-2.5 flex items-center gap-2.5">
                {r?.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name} className="w-8 h-8 rounded-lg object-cover border border-white/30 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm flex-shrink-0">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-black text-white truncate">{r?.name || 'Restaurant'}</p>
                  <p className="text-[10px] text-white/65">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center bg-white/15 rounded-lg px-2 py-1">
                  <span className="text-sm font-black text-white leading-none">{overall}</span>
                  <span className="text-[9px] text-white/60">/ 5</span>
                </div>
              </div>

              {/* Card body */}
              <div className="flex-1 p-3 space-y-2">
                {/* Restaurant */}
                <div className="rounded-lg bg-[var(--color-surface-container-low)] p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ChefHat size={11} className="text-[var(--color-primary)] flex-shrink-0" />
                    <span className="text-[10px] font-black text-[var(--color-on-surface)]">Restaurant</span>
                    <Stars rating={review.restaurantRating} />
                    <span className="text-[10px] font-bold text-[var(--color-primary)] ml-auto">{review.restaurantRating}/5</span>
                  </div>
                  {review.restaurantReview && (
                    <p className="text-[10px] text-[var(--color-on-surface-variant)] italic line-clamp-2 leading-relaxed border-l-2 border-[var(--color-primary)]/25 pl-2">
                      "{review.restaurantReview}"
                    </p>
                  )}
                </div>

                {/* Delivery */}
                {review.deliveryRating && (
                  <div className="rounded-lg bg-blue-50 p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck size={11} className="text-blue-500 flex-shrink-0" />
                      <span className="text-[10px] font-black text-[var(--color-on-surface)]">Delivery</span>
                      <Stars rating={review.deliveryRating} />
                      <span className="text-[10px] font-bold text-blue-500 ml-auto">{review.deliveryRating}/5</span>
                    </div>
                    {review.deliveryReview && (
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] italic line-clamp-2 leading-relaxed border-l-2 border-blue-200 pl-2">
                        "{review.deliveryReview}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card footer */}
              {review.isAnonymous && (
                <div className="px-3 pb-2">
                  <div className="flex items-center gap-1 text-[10px] text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)] rounded-full px-2 py-0.5 w-fit">
                    <EyeOff size={9} /> Anonymous
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-center gap-3 py-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-7 h-7 rounded-full bg-white border border-[var(--color-outline-variant)] flex items-center justify-center disabled:opacity-30 hover:border-[var(--color-primary)] transition"
          >
            <ChevronLeft size={14} className="text-[var(--color-on-surface)]" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all ${
                  i === page
                    ? 'w-5 h-2 bg-[var(--color-primary)]'
                    : 'w-2 h-2 bg-[var(--color-outline-variant)] hover:bg-[var(--color-primary)]/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-7 h-7 rounded-full bg-white border border-[var(--color-outline-variant)] flex items-center justify-center disabled:opacity-30 hover:border-[var(--color-primary)] transition"
          >
            <ChevronRight size={14} className="text-[var(--color-on-surface)]" />
          </button>
        </div>
      )}
    </div>
  );
}
