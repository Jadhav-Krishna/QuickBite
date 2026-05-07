import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Flame, Search, ShoppingCart, Star, X } from 'lucide-react';
import { menuService } from '../api/menu';
import type { MenuCategory, MenuItem } from '../api/menu';
import { restaurantService } from '../api/restaurant';
import type { Restaurant } from '../api/restaurant';
import { useCart } from '../context/CartContext';

type MenuSort = 'popular' | 'priceLowHigh' | 'priceHighLow';

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { id: 1, restaurantId: 1, name: 'Biryani & Rice', description: '', displayOrder: 1, isActive: true },
  { id: 2, restaurantId: 1, name: 'Curries', description: '', displayOrder: 2, isActive: true },
  { id: 3, restaurantId: 1, name: 'Breads', description: '', displayOrder: 3, isActive: true },
];

const FALLBACK_ITEMS: MenuItem[] = [
  { id: 1, restaurantId: 2, categoryId: 1, name: 'Hyderabadi Chicken Dum Biryani', description: 'Slow-cooked aromatic basmati rice layered with marinated chicken.', price: 349, discountedPrice: 299, isVegetarian: false, isSpicy: true, preparationTime: 20, isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', orderCount: 1240, rating: 4.8 },
  { id: 2, restaurantId: 2, categoryId: 2, name: 'Paneer Butter Masala', description: 'Soft cottage cheese cubes in a rich, creamy, and mildly sweet tomato gravy.', price: 279, discountedPrice: undefined, isVegetarian: true, isSpicy: false, preparationTime: 15, isAvailable: true, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=800&q=80', orderCount: 850, rating: 4.6 },
  { id: 3, restaurantId: 2, categoryId: 1, name: 'Veg Pulao', description: 'Mixed vegetables and rice cooked together.', price: 199, discountedPrice: undefined, isVegetarian: true, isSpicy: false, preparationTime: 15, isAvailable: false, imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80', orderCount: 300, rating: 4.1 },
];

function MenuItemSkeleton() {
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white p-4 shadow-card">
      <div className="skeleton h-24 w-24 shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

export default function Menu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<MenuSort>('popular');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const { totalItems, addToCart } = useCart();
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!restaurantId) return;
    const id = Number(restaurantId);
    setLoading(true);
    setError(null);
    Promise.all([
      restaurantService.getRestaurantById(id).catch(() => null),
      menuService.getMenuByRestaurant(id).catch(() => FALLBACK_ITEMS),
      menuService.getRestaurantCategories(id).catch(() => FALLBACK_CATEGORIES),
    ]).then(([rest, menuItems, categoryData]) => {
      setRestaurant(rest || {
        id, ownerId: 2, name: 'Spice Route Kitchen', cuisineType: 'North Indian',
        description: 'Rich curries, tandoori platters, and biryani bowls crafted with authentic spices.',
        address: '12 MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038',
        rating: 4.5, reviewCount: 214, isActive: true, isOpen: true,
        deliveryFee: 39, estimatedDeliveryMin: 35,
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        openingTime: '11:00', closingTime: '23:00'
      });
      setItems(menuItems.length > 0 ? menuItems : FALLBACK_ITEMS);
      setCategories((categoryData.length > 0 ? categoryData : FALLBACK_CATEGORIES).sort((a, b) => a.displayOrder - b.displayOrder));
    }).catch(() => {
      setError('Unable to load live menu data right now.');
    }).finally(() => setLoading(false));
  }, [restaurantId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const matchesVeg = !vegOnly || item.isVegetarian;
      return matchesSearch && matchesCategory && matchesVeg;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'priceLowHigh') return a.price - b.price;
      if (sortBy === 'priceHighLow') return b.price - a.price;
      return (b.orderCount || 0) - (a.orderCount || 0);
    });
  }, [items, search, selectedCategory, vegOnly, sortBy]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<number | 'ALL', MenuItem[]>();
    if (selectedCategory !== 'ALL') {
      map.set(selectedCategory, filteredItems);
      return map;
    }
    for (const cat of categories) {
      const catItems = filteredItems.filter((i) => i.categoryId === cat.id);
      if (catItems.length) map.set(cat.id, catItems);
    }
    // uncategorised
    const uncategorised = filteredItems.filter((i) => !i.categoryId || !categories.find((c) => c.id === i.categoryId));
    if (uncategorised.length) map.set('ALL', uncategorised);
    return map;
  }, [filteredItems, categories, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    console.log('Adding item to cart:', item);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.discountedPrice || item.price,
      quantity: 1,
      restaurantId: Number(restaurantId),
      img: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    }).then(() => {
      console.log('Item added successfully');
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 1400);
    }).catch((error) => {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    });
  };

  const scrollToCategory = (catId: number) => {
    setSelectedCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const discountPct = (item: MenuItem) => {
    if (!item.discountedPrice || item.discountedPrice >= item.price) return 0;
    return Math.round(((item.price - item.discountedPrice) / item.price) * 100);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-28">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-surface-variant)]/60 bg-[var(--color-surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 px-4">
            {restaurant && (
              <div>
                <h2 className="font-display text-lg font-bold leading-tight line-clamp-1">{restaurant.name}</h2>
                <p className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)]">
                  <Star size={10} fill="currentColor" className="text-[var(--color-primary)]" />
                  {restaurant.rating?.toFixed(1)} · {restaurant.cuisineType} · {restaurant.city}
                </p>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]">
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Restaurant hero banner ── */}
      {restaurant && (
        <div className="relative h-52 w-full overflow-hidden md:h-64">
          <img
            src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-6 flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full shadow ring-2 ring-white ${restaurant.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-on-surface)] backdrop-blur">
              {restaurant.isActive ? 'Open Now' : 'Closed'}
            </span>
            {restaurant.estimatedDeliveryMin && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-on-surface)] backdrop-blur">
                <Clock size={10} /> {restaurant.estimatedDeliveryMin}–{restaurant.estimatedDeliveryMin + 20} min
              </span>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 pt-6 md:px-8">

        {/* ── Search + filters ── */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/50 bg-white px-4 py-3 shadow-card focus-within:border-[var(--color-primary)] transition">
            <Search size={16} className="shrink-0 text-[var(--color-on-surface-variant)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-on-surface-variant)]/60"
            />
            {search && (
              <button onClick={() => setSearch('')} className="shrink-0 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]">
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as MenuSort)}
            className="rounded-2xl border border-[var(--color-outline-variant)]/50 bg-white px-4 py-3 text-sm font-semibold text-[var(--color-on-surface)] shadow-card outline-none focus:border-[var(--color-primary)]"
          >
            <option value="popular">🔥 Popular</option>
            <option value="priceLowHigh">💰 Price ↑</option>
            <option value="priceHighLow">💎 Price ↓</option>
          </select>

          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--color-outline-variant)]/50 bg-white px-4 py-3 text-sm font-semibold text-[var(--color-on-surface)] shadow-card transition hover:border-green-400">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="accent-green-500"
            />
            🌿 Veg Only
          </label>
        </div>

        {/* ── Two-column layout on desktop ── */}
        <div className="flex gap-8">

          {/* ── Sidebar: Category nav (desktop) ── */}
          {categories.length > 0 && !loading && (
            <aside className="hidden w-52 shrink-0 md:block">
              <div className="sticky top-20 space-y-1 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white p-3 shadow-card">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Categories</p>
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === 'ALL' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'}`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === cat.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile horizontal category scroll */}
            {categories.length > 0 && !loading && (
              <div className="mb-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-thin md:hidden">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${selectedCategory === 'ALL' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-on-surface-variant)] shadow-card hover:bg-[var(--color-surface-container)]'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${selectedCategory === cat.id ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-on-surface-variant)] shadow-card hover:bg-[var(--color-surface-container)]'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">⚠️ {error}</div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1,2,3,4,5].map((i) => <MenuItemSkeleton key={i} />)}
              </div>
            )}

            {/* Grouped items */}
            {!loading && !error && (
              <div className="space-y-10">
                {[...groupedByCategory.entries()].map(([catId, catItems]) => {
                  const catName = catId === 'ALL'
                    ? 'Other Items'
                    : categories.find((c) => c.id === catId)?.name || 'Items';
                  return (
                    <div
                      key={catId}
                      ref={(el) => { if (typeof catId === 'number') categoryRefs.current[catId] = el; }}
                    >
                      <h2 className="mb-4 font-display text-2xl font-bold">{catName}</h2>
                      <div className="space-y-4">
                        {catItems.map((item) => {
                          const isAdded = addedIds.has(item.id);
                          const disc = discountPct(item);
                          const finalPrice = item.discountedPrice || item.price;
                          return (
                            <Link
                              to={`/item/${item.id}`}
                              key={item.id}
                              className="card-hover group flex cursor-pointer items-start gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-card hover:border-[var(--color-outline-variant)] md:gap-5"
                            >
                              {/* Image */}
                              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl md:h-32 md:w-32">
                                <img
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {disc > 0 && (
                                  <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                    -{disc}%
                                  </span>
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex flex-1 flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {/* Veg / Non-veg dot */}
                                  <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border-2 p-0.5 ${item.isVegetarian ? 'border-green-600' : 'border-red-600'}`}>
                                    <span className={`block h-full w-full rounded-full ${item.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                                  </span>
                                  <h3 className="font-display text-lg font-bold line-clamp-1">{item.name}</h3>
                                  {item.isSpicy && <Flame size={14} className="shrink-0 text-orange-500" />}
                                </div>

                                <p className="line-clamp-2 text-sm leading-relaxed text-[var(--color-on-surface-variant)]">{item.description}</p>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-on-surface-variant)]">
                                  {item.rating && item.rating > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Star size={10} fill="currentColor" className="text-[var(--color-primary)]" /> {item.rating.toFixed(1)}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} /> {item.preparationTime} min
                                  </span>
                                  {item.orderCount && item.orderCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      🔥 {item.orderCount > 999 ? `${(item.orderCount / 1000).toFixed(1)}k` : item.orderCount} orders
                                    </span>
                                  )}
                                </div>

                                {/* Price + Add button */}
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-display text-xl font-bold text-[var(--color-on-surface)]">
                                      ₹{finalPrice.toFixed(0)}
                                    </span>
                                    {disc > 0 && (
                                      <span className="text-sm text-[var(--color-on-surface-variant)] line-through">₹{item.price.toFixed(0)}</span>
                                    )}
                                  </div>
                                  <button
                                    id={`add-to-cart-${item.id}`}
                                    onClick={(e) => handleAddToCart(e, item)}
                                    disabled={!item.isAvailable}
                                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-card transition-all ${
                                      isAdded
                                        ? 'bg-green-500 text-white scale-95'
                                        : item.isAvailable
                                          ? 'bg-[var(--color-primary)] text-white hover:opacity-90 hover:scale-105'
                                          : 'cursor-not-allowed bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <><Check size={13} /> Added</>
                                    ) : !item.isAvailable ? (
                                      'Unavailable'
                                    ) : (
                                      '+ Add'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <span className="text-5xl">🍽️</span>
                    <p className="font-display text-xl font-bold">No dishes match your filters</p>
                    <button
                      onClick={() => { setSearch(''); setVegOnly(false); setSelectedCategory('ALL'); }}
                      className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Floating cart bar ── */}
      {totalItems > 0 && (
        <div className="fixed inset-x-4 bottom-6 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96">
          <Link
            to="/cart"
            className="hero-button flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-glow"
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <ShoppingCart size={16} />
              {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
            </span>
            <span className="text-sm font-bold">View Cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
