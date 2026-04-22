import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bell, ChefHat, Clock, Flame, MapPin,
  Search, ShoppingBag, Sparkles, Star, Truck, Zap, Menu, User, Plus
} from 'lucide-react';
import { restaurantService } from '../api/restaurant';
import type { Restaurant } from '../api/restaurant';
import { menuService, type MenuItem } from '../api/menu';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CUISINE_PILLS = [
  { label: 'North Indian', emoji: '🍛', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'South Indian', emoji: '🥞', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Street Food', emoji: '🌮', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Biryani', emoji: '🍚', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { label: 'Desserts', emoji: '🍨', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'Chinese', emoji: '🥡', color: 'bg-red-50 text-red-700 border-red-200' },
];

const PERKS = [
  { icon: Zap, title: 'Lightning Delivery', desc: 'Most orders arrive in under 40 mins' },
  { icon: ChefHat, title: 'Artisanal Menus', desc: 'Curated from the finest restaurants' },
  { icon: Truck, title: 'Live Tracking', desc: 'Watch your order move in real time' },
];

const NAV_LINKS = [
  { label: 'Discover', to: '/' },
  { label: 'Our Chefs', to: '/restaurants' },
  { label: 'Seasonal', to: '/restaurants?cuisine=seasonal' },
  { label: 'The Pantry', to: '/restaurants' },
];

export default function Landing() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dishesLoading, setDishesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { totalItems, addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch live restaurants from DB
    restaurantService.getAllRestaurants()
      .then((data) => setRestaurants(data))
      .catch((err) => console.error("Failed to load restaurants:", err))
      .finally(() => setLoading(false));

    // Fetch live menu items to feature
    // We'll search for popular items or just fetch some by querying an empty string or "a" to get random items
    menuService.searchMenuItems('a')
      .then((data) => {
        // Pick top 3 for featured
        setFeaturedDishes(data.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load dishes:", err))
      .finally(() => setDishesLoading(false));
  }, []);

  const featuredRestaurants = useMemo(() => restaurants.slice(0, 3), [restaurants]);

  const handleAddDishToCart = (dish: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(dish, 1, dish.restaurantId);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: '#F5F0E8', color: '#1a1a1a', fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', Georgia, serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .text-brand { color: #C84B31; }
        .bg-brand { background: #C84B31; }
        .border-brand { border-color: #C84B31; }
        .bg-sage { background: #D4E4C3; }
        .bg-dark { background: #1C1C1C; }
        .bg-cream { background: #F5F0E8; }
        .hero-img-mask { border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; overflow: hidden; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(28px); } to { opacity:1; transform: translateY(0); } }
        @keyframes floatBadge { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .anim-fade-up { animation: fadeUp 0.7s ease forwards; }
        .anim-delay-100 { animation-delay: 0.1s; opacity: 0; }
        .anim-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .anim-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .anim-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .float-badge { animation: floatBadge 3s ease-in-out infinite; }
        .card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        .btn-brand { background: #C84B31; color: #fff; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-weight: 600; letter-spacing: 0.05em; transition: background 0.2s, transform 0.2s; }
        .btn-brand:hover { background: #a83825; transform: scale(1.02); }
        .btn-outline { border: 1.5px solid #1a1a1a; border-radius: 999px; background: transparent; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: background 0.2s, color 0.2s; }
        .btn-outline:hover { background: #1a1a1a; color: #F5F0E8; }
        .dish-card-active { background: #1C1C1C; color: #fff; transform: translateY(-12px) scale(1.04); box-shadow: 0 32px 80px rgba(0,0,0,0.3); }
        .pill-hover { transition: all 0.2s ease; }
        .pill-hover:hover { background: #C84B31; color: #fff; border-color: #C84B31; }
        .nav-underline { position: relative; }
        .nav-underline::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: #C84B31; transition: width 0.2s; }
        .nav-underline:hover::after { width: 100%; }
        input:focus { outline: none; }
      `}</style>

      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-50 px-6 py-4 md:px-10" style={{ background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link to="/" className="font-playfair text-xl font-bold tracking-tight" style={{ color: '#C84B31' }}>
            Sage &amp; Savor
          </Link>
          <nav className="hidden items-center gap-8 font-dm text-sm font-medium text-gray-600 md:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="nav-underline transition hover:text-gray-900">{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition">
              <Search size={17} />
            </button>
            <Link to="/notifications" className="relative h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition hidden md:flex">
              <Bell size={17} />
            </Link>
            <Link to="/cart" className="relative h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition hidden md:flex">
              <ShoppingBag size={17} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: '#C84B31' }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to={user ? '/profile' : '/login'}
              className="btn-brand hidden md:inline-flex items-center gap-2 px-5 py-2 text-sm ml-1"
            >
              {user ? user.fullName.split(' ')[0] : 'Order Now'}
            </Link>
            <button className="flex md:hidden h-9 w-9 items-center justify-center rounded-full hover:bg-black/5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-2xl bg-white shadow-xl p-5 space-y-3 font-dm text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="block py-1 text-gray-700 hover:text-brand" onClick={() => setMobileMenuOpen(false)}>{l.label}</Link>
            ))}
            <div className="pt-2 flex gap-2">
              <Link to="/cart" className="flex items-center gap-1.5 text-gray-600"><ShoppingBag size={15} /> Cart {totalItems > 0 && <span className="text-brand font-bold">({totalItems})</span>}</Link>
              <Link to={user ? '/profile' : '/login'} className="ml-auto btn-brand px-4 py-1.5 text-xs">{user ? user.fullName.split(' ')[0] : 'Sign in'}</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-12 px-6 md:px-10 overflow-hidden" style={{ minHeight: '92vh' }}>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-10 pt-10 md:pt-16">
          <div className="flex-1 anim-fade-up anim-delay-100 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 font-dm text-xs font-semibold uppercase tracking-widest" style={{ background: '#E8E0D0', color: '#6B5E4A' }}>
              <span style={{ color: '#C84B31' }}>✦</span> Established 2024
            </div>
            <h1 className="font-playfair leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900 }}>
              Exciting<br />Treats,<br />
              <em style={{ color: '#C84B31', fontStyle: 'italic' }}>Available Daily.</em>
            </h1>
            <p className="font-dm mt-5 text-base leading-7 max-w-md mx-auto md:mx-0" style={{ color: '#6B5E4A', fontSize: '1rem' }}>
              Experience a digital food magazine you can eat from. Boutique craftsmanship met with seasonal ingredients delivered to your doorstep.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <Link to="/restaurants" className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 text-sm">
                Explore Menu <ArrowRight size={15} />
              </Link>
              <Link to="/auth" className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 text-sm">
                View Journal
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 justify-center md:justify-start font-dm text-sm" style={{ color: '#6B5E4A' }}>
              <span className="flex items-center gap-1.5"><Star size={14} style={{ color: '#C84B31' }} fill="#C84B31" /> 4.8 avg rating</span>
              <span className="flex items-center gap-1.5"><Truck size={14} /> Under 40 min delivery</span>
              <span className="flex items-center gap-1.5"><ChefHat size={14} /> {restaurants.length || 50}+ curated restaurants</span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center anim-fade-up anim-delay-200">
            <div className="relative w-[280px] h-[320px] md:w-[360px] md:h-[400px]">
              <div className="hero-img-mask w-full h-full" style={{ border: '4px solid #C84B31' }}>
                <img
                  src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80"
                  alt="Chef presenting food"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="float-badge absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 font-dm">
                <span className="text-2xl">🍅</span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#C84B31' }}>Trending Now</p>
                  <p className="text-xs font-bold text-gray-800">Margherita Pizza</p>
                </div>
              </div>
              <div className="float-badge absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 font-dm" style={{ animationDelay: '1.5s' }}>
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#C84B31' }}>Top Rated</p>
                  <p className="text-xs font-bold text-gray-800">4.6 · Bombay Chaat</p>
                </div>
              </div>
              <div className="float-badge absolute top-1/2 -left-10 bg-white rounded-2xl shadow-xl px-3 py-2 font-dm hidden md:block" style={{ animationDelay: '0.8s' }}>
                <span className="text-2xl">🌿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search bar ── */}
      <section className="px-6 md:px-10 pb-10">
        <div className="mx-auto max-w-2xl anim-fade-up anim-delay-300">
          <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-lg" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
            <Search size={18} className="ml-5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`);
                }
              }}
              placeholder="Search flavours, restaurants..."
              className="flex-1 bg-transparent px-4 py-4 text-sm font-dm placeholder-gray-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <Link
              to={`/restaurants${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`}
              className="btn-brand m-1.5 flex items-center gap-2 px-5 py-3 text-sm"
            >
              Search <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cuisine pills ── */}
      <section className="px-6 pb-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-playfair mb-6 text-center text-2xl font-bold md:text-3xl">What are you craving?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CUISINE_PILLS.map((pill) => (
              <Link
                key={pill.label}
                to={`/restaurants?cuisine=${encodeURIComponent(pill.label)}`}
                className={`pill-hover flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold font-dm ${pill.color}`}
              >
                <span className="text-lg">{pill.emoji}</span> {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Delights (Dish cards) ── */}
      <section className="px-6 pb-20 md:px-10" style={{ background: '#1C1C1C' }}>
        <div className="mx-auto max-w-7xl py-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-dm mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#C84B31' }}>Weekly Curation</p>
              <h2 className="font-playfair text-3xl font-bold text-white md:text-4xl">Featured Delights</h2>
              <p className="font-dm mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Live dishes from our platform's top restaurants</p>
            </div>
            <Link to="/restaurants" className="font-dm flex items-center gap-1 text-sm font-semibold transition" style={{ color: '#C84B31' }}>
              Browse All <ArrowRight size={15} />
            </Link>
          </div>
          
          {dishesLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[360px] rounded-3xl bg-[#2a2a2a] animate-pulse" />
              ))}
            </div>
          ) : featuredDishes.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {featuredDishes.map((dish, i) => {
                const isSignature = i === 1; // highlight middle dish
                return (
                  <div
                    key={dish.id}
                    onClick={() => navigate(`/menu/${dish.restaurantId}`)}
                    className={`card-lift relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer ${isSignature ? 'dish-card-active' : 'bg-[#2a2a2a]'}`}
                  >
                    {isSignature && (
                      <div className="absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-dm text-white" style={{ background: '#C84B31' }}>
                        Signature
                      </div>
                    )}
                    <div className="h-48 overflow-hidden bg-gray-800">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-playfair text-xl font-bold text-white line-clamp-1">{dish.name}</h3>
                      <p className="font-dm mt-1 text-sm line-clamp-2 h-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {dish.description || 'A delicious culinary creation'}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-playfair text-2xl font-bold text-white">₹{dish.price}</span>
                        {isSignature ? (
                          <button 
                            onClick={(e) => handleAddDishToCart(dish, e)}
                            className="btn-brand px-5 py-2 text-xs font-dm"
                          >
                            Add to Order
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => handleAddDishToCart(dish, e)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-110" style={{ background: 'rgba(200,75,49,0.3)', border: '1px solid rgba(200,75,49,0.5)' }}
                          >
                            <Plus size={18} style={{ color: '#C84B31' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-700 rounded-3xl">
               <p className="font-playfair text-xl font-bold text-gray-400">No dishes available right now</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Restaurants ── */}
      <section className="px-6 pb-20 md:px-10 bg-cream">
        <div className="mx-auto max-w-7xl pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-dm mb-1 text-xs font-bold uppercase tracking-widest text-brand">Top Picks</p>
              <h2 className="font-playfair text-3xl font-bold md:text-4xl">Our Restaurant Partners</h2>
            </div>
            <Link to="/restaurants" className="font-dm flex items-center gap-1 text-sm font-bold text-brand transition hover:gap-2">
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-3xl bg-white shadow">
                  <div className="h-52 w-full bg-gray-100 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredRestaurants.map((r) => (
                <Link
                  key={r.id}
                  to={`/menu/${r.id}`}
                  className="card-lift group relative overflow-hidden rounded-3xl bg-white shadow"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                      alt={r.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur font-dm" style={{ color: '#C84B31' }}>
                      <Star size={11} fill="#C84B31" color="#C84B31" /> {r.rating || 4.2}
                    </span>
                    <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-800 backdrop-blur font-dm">
                      {r.cuisineType}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-playfair text-xl font-bold">{r.name}</h3>
                    <p className="font-dm mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} /> {r.city || 'India'}
                    </p>
                    <p className="font-dm mt-2 line-clamp-2 text-sm text-gray-500">{r.description}</p>
                    <div className="font-dm mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Truck size={11} /> ₹{(r.deliveryFee || 40).toFixed(0)} delivery</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {r.estimatedDeliveryMin || 30}–{(r.estimatedDeliveryMin || 30) + 15} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-gray-200 py-20 bg-white">
              <span className="text-5xl">🍽️</span>
              <p className="font-playfair text-xl font-bold">Your Database is Empty</p>
              <p className="font-dm text-sm text-gray-500">Register a restaurant partner or log in as admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 50% Off Promo ── */}
      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-sage">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 p-10 md:p-14 flex flex-col justify-center">
              <span className="font-dm mb-3 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: 'rgba(0,0,0,0.15)', color: '#4A6741' }}>
                Lunch Special
              </span>
              <h2 className="font-playfair text-4xl font-black leading-tight md:text-5xl" style={{ color: '#1a1a1a' }}>
                50% Off<br />Our Iconic<br />Salad Bowl.
              </h2>
              <div className="font-dm mt-5 flex gap-6 text-sm font-semibold" style={{ color: '#4A6741' }}>
                <div><p className="text-xl font-black text-gray-800">320</p><p className="text-xs uppercase tracking-wide">Calories</p></div>
                <div><p className="text-xl font-black text-gray-800">12g</p><p className="text-xs uppercase tracking-wide">Protein</p></div>
                <div><p className="text-xl font-black text-gray-800">Vegan</p><p className="text-xs uppercase tracking-wide">Options</p></div>
              </div>
              <p className="font-dm mt-4 text-sm leading-6" style={{ color: '#4A6741' }}>
                Redeemable every Tuesday for our loyal community members. Hand-picked ingredients from our rooftop garden.
              </p>
              <Link to="/restaurants?q=Salad" className="btn-brand mt-7 inline-flex w-fit items-center gap-2 px-7 py-3.5 text-sm" style={{ background: '#2D4A25' }}>
                Claim Discount
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 md:p-0">
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
                alt="Salad bowl"
                className="w-full h-64 md:h-full object-cover md:rounded-none rounded-2xl"
                style={{ maxHeight: '380px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Midnight Cravings ── */}
      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] relative" style={{ minHeight: '280px' }}>
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"
            alt="Pizza at night"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(15,10,5,0.72)' }} />
          <div className="relative p-10 md:p-14 flex flex-col items-start justify-center" style={{ minHeight: '280px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={18} style={{ color: '#C84B31' }} />
              <span className="font-dm text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>After Hours</span>
            </div>
            <h2 className="font-playfair text-4xl font-black text-white md:text-5xl">Midnight Cravings</h2>
            <p className="font-dm mt-2 max-w-sm text-sm leading-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Any 2 Pizzas for ₹649. Available from 10 PM to 2 AM daily. For the night owls only.
            </p>
            <Link to="/restaurants?q=Pizza" className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold font-dm text-white transition hover:bg-white/20" style={{ border: '1.5px solid rgba(255,255,255,0.4)' }}>
              Order Late Night <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 overflow-hidden rounded-[2.5rem] bg-dark p-2 md:grid-cols-3">
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.title} className="flex items-center gap-5 rounded-[2rem] p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(200,75,49,0.18)' }}>
                    <Icon size={24} style={{ color: '#E8856A' }} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-bold text-white">{perk.title}</h3>
                    <p className="font-dm text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{perk.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] bg-sage p-10 md:p-16 text-center">
          <p className="font-playfair italic text-2xl font-bold mb-1" style={{ color: '#2D4A25' }}>Join the Table</p>
          <h2 className="font-playfair text-3xl font-black md:text-4xl" style={{ color: '#1a1a1a' }}>
            For recipes, early access, and stories.
          </h2>
          <p className="font-dm mt-3 text-sm" style={{ color: '#4A6741' }}>Subscribe to our weekly editorial digest and never miss a flavor trend.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-xl px-5 py-3 text-sm font-dm bg-white/80 placeholder-gray-400 text-gray-800"
              style={{ border: '1px solid rgba(0,0,0,0.12)' }}
            />
            <button className="rounded-xl px-6 py-3 text-sm font-bold font-dm text-white transition hover:opacity-90" style={{ background: '#2D4A25' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-dark px-6 pt-16 pb-8 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="col-span-2 md:col-span-1">
              <p className="font-playfair text-2xl font-bold" style={{ color: '#F5F0E8' }}>Sage &amp; Savor</p>
              <p className="font-dm mt-3 text-sm leading-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Elevating daily dining through thoughtful curation and passionate preparation.</p>
            </div>
            {[
              { title: 'Navigation', links: ['Journal', 'Sustainability', 'Our Story', 'Careers'] },
              { title: 'Connect', links: ['Instagram', 'Pinterest', 'Twitter', 'LinkedIn'] },
              { title: 'Contact', links: ['hello@sageandsavor.com', '123 Culinary Way', 'Raipur, CG 492001'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-dm text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><span className="font-dm text-sm cursor-pointer hover:text-white transition" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-dm text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2024 Sage &amp; Savor. All rights reserved.</p>
            <div className="flex gap-6 font-dm text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span className="cursor-pointer hover:text-white transition">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white transition">Terms of Use</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around rounded-t-3xl bg-white/95 px-4 pb-6 pt-4 shadow-2xl backdrop-blur-xl md:hidden" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {[
          { label: 'Discover', to: '/', icon: Sparkles },
          { label: 'Cuisine', to: '/restaurants', icon: ChefHat },
          { label: 'Orders', to: '/tracking', icon: ShoppingBag },
          { label: 'Profile', to: '/login', icon: User },
        ].map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center justify-center rounded-full px-4 py-2 gap-1 font-dm text-[10px] font-bold uppercase tracking-widest transition hover:text-brand"
            style={{ color: '#9C8E7E' }}
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}