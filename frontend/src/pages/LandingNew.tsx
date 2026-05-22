import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Clock, Zap, Shield, Heart,
  TrendingUp, Sparkles, ChefHat, Bike
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { restaurantService, type Restaurant } from '../api/restaurant';
import { menuService, type MenuItem } from '../api/menu';
import FoodAppNavbar from '../components/FoodAppNavbar';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Delivery in 30 mins' },
  { icon: Shield, title: 'Safe & Hygienic', desc: 'Contactless delivery' },
  { icon: Heart, title: 'Fresh Food', desc: 'Quality guaranteed' },
  { icon: TrendingUp, title: 'Best Prices', desc: 'Great deals daily' },
];

const CUISINES = [
  { name: 'Biryani', emoji: '🍛', gradient: 'from-orange-400 to-red-500' },
  { name: 'Pizza', emoji: '🍕', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Burger', emoji: '🍔', gradient: 'from-red-400 to-pink-500' },
  { name: 'Chinese', emoji: '🥡', gradient: 'from-red-500 to-rose-600' },
  { name: 'Desserts', emoji: '🍰', gradient: 'from-pink-400 to-rose-500' },
  { name: 'Healthy', emoji: '🥗', gradient: 'from-green-400 to-emerald-500' },
];

export default function LandingPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const cuisinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch data
    Promise.all([
      restaurantService.getAllRestaurants(),
      menuService.searchMenuItems('a')
    ])
      .then(([restaurantsData, dishesData]) => {
        setRestaurants(restaurantsData.slice(0, 6));
        setDishes(dishesData.slice(0, 8));
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        delay: 0.2,
      })
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
      }, '-=0.5')
      .from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, '-=0.5');

      // Hero image parallax
      if (heroImageRef.current) {
        gsap.to(heroImageRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // Features animation
      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        });
      }

      // Cuisines animation
      if (cuisinesRef.current) {
        gsap.from(cuisinesRef.current.children, {
          scale: 0,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: cuisinesRef.current,
            start: 'top 80%',
          },
        });
      }

      // Floating animations for decorative elements
      gsap.to('.float-1', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.float-2', {
        y: -30,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5,
      });

      gsap.to('.float-3', {
        y: -25,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="float-1 absolute top-20 right-20 w-64 h-64 bg-red-200/30 rounded-full blur-3xl" />
        <div className="float-2 absolute bottom-40 left-20 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="float-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-red-600">Order Now, Eat in 30 mins</span>
            </div>

            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6"
            >
              Delicious Food
              <br />
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Order from your favorite restaurants and get fresh, hot food delivered to your doorstep in minutes.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/restaurants"
                className="group bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/restaurants"
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-200"
              >
                Explore Menu
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-3xl font-black text-red-600">{restaurants.length || 50}+</div>
                <div className="text-sm text-slate-600 font-semibold">Restaurants</div>
              </div>
              <div>
                <div className="text-3xl font-black text-red-600">10K+</div>
                <div className="text-sm text-slate-600 font-semibold">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-black text-red-600">4.8★</div>
                <div className="text-sm text-slate-600 font-semibold">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div ref={heroImageRef} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-[3rem] blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
                alt="Delicious food"
                className="relative rounded-[3rem] shadow-2xl w-full h-[600px] object-cover"
              />
              
              {/* Floating cards */}
              <div className="float-1 absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Top Rated</div>
                  <div className="text-sm font-black text-slate-900">Premium Chefs</div>
                </div>
              </div>

              <div className="float-2 absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Bike className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Fast Delivery</div>
                  <div className="text-sm font-black text-slate-900">30 Minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div ref={featuresRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              What's on your mind?
            </h2>
            <p className="text-lg text-slate-600">Explore cuisines from around the world</p>
          </div>

          <div ref={cuisinesRef} className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.name}
                to={`/restaurants?q=${cuisine.name}`}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${cuisine.gradient} rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300`}>
                  {cuisine.emoji}
                </div>
                <span className="text-sm font-bold text-slate-900">{cuisine.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-20 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                Top Restaurants
              </h2>
              <p className="text-lg text-slate-600">Handpicked for you</p>
            </div>
            <Link
              to="/restaurants"
              className="text-red-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              See All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-100 rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/menu/${restaurant.id}`}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{restaurant.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 mb-2">{restaurant.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{restaurant.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {restaurant.estimatedDeliveryMin || 30} mins
                      </span>
                      <span className="font-bold text-red-600">₹{restaurant.deliveryFee || 40} delivery</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-rose-600 rounded-[3rem] p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Hungry? Order Now!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your favorite food delivered in 30 minutes
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Start Ordering
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Food App Navbar */}
      <FoodAppNavbar />
    </div>
  );
}
