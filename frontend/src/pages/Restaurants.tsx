import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, MapPin, Search, SlidersHorizontal, Star, Truck, X } from 'lucide-react';
import { restaurantService } from '../api/restaurant';
import type { Restaurant } from '../api/restaurant';
import { useCart } from '../context/CartContext';

type RestaurantSort = 'rating' | 'name' | 'deliveryFee';

const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: 1, ownerId: 2, name: 'Spice Route Kitchen', cuisineType: 'North Indian',
    description: 'Rich curries, tandoori platters, and biryani bowls crafted with authentic spices.',
    address: '12 MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038',
    rating: 4.5, reviewCount: 214, isActive: true, isOpen: true,
    deliveryFee: 39, estimatedDeliveryMin: 35,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    openingTime: '11:00', closingTime: '23:00',
  },
  {
    id: 2, ownerId: 2, name: 'Dosa Darbar', cuisineType: 'South Indian',
    description: 'Crispy dosas, filter coffee, and hearty tiffin combos — straight from Chennai.',
    address: '44 Cathedral Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600086',
    rating: 4.3, reviewCount: 163, isActive: true, isOpen: true,
    deliveryFee: 29, estimatedDeliveryMin: 28,
    imageUrl: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80',
    openingTime: '07:30', closingTime: '22:30',
  },
  {
    id: 3, ownerId: 2, name: 'Bombay Chaat Co.', cuisineType: 'Street Food',
    description: 'Mumbai-style chaat, pav bhaji, and kulfi desserts — bold street flavours delivered hot.',
    address: '8 Carter Road, Bandra', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
    rating: 4.6, reviewCount: 301, isActive: true, isOpen: true,
    deliveryFee: 49, estimatedDeliveryMin: 40,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    openingTime: '10:30', closingTime: '23:30',
  },
];

function RestaurantSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'ALL');
  const [sortBy, setSortBy] = useState<RestaurantSort>('rating');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    restaurantService.getAllRestaurants()
      .then((data) => setRestaurants(data.length > 0 ? data : FALLBACK_RESTAURANTS))
      .catch(() => {
        // Backend offline — show fallback seed data so UI always looks populated
        setRestaurants(FALLBACK_RESTAURANTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const cuisines = useMemo(() => {
    const unique = Array.from(new Set(restaurants.map((r) => r.cuisineType).filter(Boolean)));
    return ['ALL', ...unique];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = restaurants.filter((r) => {
      const matchesCuisine = selectedCuisine === 'ALL' || r.cuisineType === selectedCuisine;
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.cuisineType.toLowerCase().includes(query) ||
        (r.city || '').toLowerCase().includes(query);
      return matchesCuisine && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'deliveryFee') return (a.deliveryFee || 0) - (b.deliveryFee || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [restaurants, search, selectedCuisine, sortBy]);

  const activeFiltersCount = (search ? 1 : 0) + (selectedCuisine !== 'ALL' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-24">

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-surface-variant)]/60 bg-[var(--color-surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-2xl font-black text-[var(--color-primary)]">QuickBite</Link>
          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)] transition hover:scale-105 hover:text-[var(--color-primary)]"
          >
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-10 md:px-8">

        {/* ── Page heading ── */}
        <div className="mb-8 animate-fade-up">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">Discover</p>
          <h1 className="font-display text-4xl font-black md:text-5xl">Find Your Next Meal</h1>
          <p className="mt-2 text-[var(--color-on-surface-variant)]">
            {restaurants.length > 0 ? `${restaurants.length} restaurants available near you` : 'Search by cuisine, city, and rating.'}
          </p>
        </div>

        {/* ── Glassmorphism filter bar ── */}
        <div className="animate-fade-up delay-100 mb-8">
          {/* Search row */}
          <div className="flex gap-3">
            <div className="flex flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/50 bg-white/80 px-5 py-3 shadow-card backdrop-blur focus-within:border-[var(--color-primary)] transition">
              <Search size={17} className="shrink-0 text-[var(--color-on-surface-variant)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants, cuisine, city…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-on-surface-variant)]/60"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]">
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${filtersOpen || activeFiltersCount > 0 ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-outline-variant)]/50 bg-white/80 text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFiltersCount > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${filtersOpen ? 'bg-white text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-white'}`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filter panel */}
          {filtersOpen && (
            <div className="mt-3 animate-fade-in grid grid-cols-1 gap-3 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white/90 p-4 shadow-card backdrop-blur md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Cuisine</label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  {cuisines.map((c) => (
                    <option key={c} value={c}>{c === 'ALL' ? 'All Cuisines' : c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as RestaurantSort)}
                  className="w-full rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="deliveryFee">🚴 Lowest Delivery Fee</option>
                  <option value="name">🔤 Name A–Z</option>
                </select>
              </div>
            </div>
          )}

          {/* Active cuisine pills */}
          {!filtersOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${selectedCuisine === c ? 'bg-[var(--color-primary)] text-white shadow-glow' : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'}`}
                >
                  {c === 'ALL' ? 'All' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Results count ── */}
        {!loading && !error && (
          <p className="mb-5 text-sm font-semibold text-[var(--color-on-surface-variant)]">
            {filteredRestaurants.length === 0
              ? 'No restaurants match your filters'
              : `Showing ${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* ── Card grid ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [1,2,3,4,5,6].map((i) => <RestaurantSkeleton key={i} />)
            : filteredRestaurants.map((r, i) => (
              <Link
                to={`/menu/${r.id}`}
                key={r.id}
                className={`animate-fade-up delay-${Math.min((i % 3 + 1) * 100, 300)} card-hover group relative overflow-hidden rounded-[2rem] bg-white shadow-card`}
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Cuisine badge */}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-on-surface)] backdrop-blur shadow-sm">
                    {r.cuisineType}
                  </span>

                  {/* Rating */}
                  <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[var(--color-primary)] shadow-sm">
                    <Star size={11} fill="currentColor" /> {r.rating?.toFixed(1) || '0.0'}
                    <span className="font-normal text-[var(--color-on-surface-variant)]">({r.reviewCount || 0})</span>
                  </span>

                  {/* Open indicator */}
                  <span className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white ${r.isActive ? 'bg-green-400 animate-pulse-glow' : 'bg-gray-400'}`} title={r.isActive ? 'Open' : 'Closed'} />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold line-clamp-1">{r.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)]">
                    <MapPin size={11} className="shrink-0" /> {r.address ? `${r.address.split(',').slice(-2).join(',').trim()}` : r.city || 'India'}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-on-surface-variant)]">{r.description}</p>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-surface-variant)] pt-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                      <Truck size={12} className="text-[var(--color-primary)]" />
                      ₹{(r.deliveryFee || 0).toFixed(0)} delivery
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-on-surface-variant)]">
                      <Clock size={12} className="text-[var(--color-primary)]" />
                      {r.estimatedDeliveryMin || 30}–{(r.estimatedDeliveryMin || 30) + 20} min
                    </span>
                    <span className="text-xs font-bold text-[var(--color-primary)] transition group-hover:gap-2">
                      View Menu →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>

        {/* ── Empty state ── */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-[var(--color-outline-variant)] py-24 text-center">
            <span className="text-6xl">🍽️</span>
            <p className="font-display text-2xl font-bold">Nothing matches your filters</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Try clearing filters or searching something else.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCuisine('ALL'); }}
              className="mt-2 rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}