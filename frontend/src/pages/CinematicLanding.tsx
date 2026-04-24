import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Clock, Users, Award, Zap, Shield, Heart, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { restaurantService, type Restaurant } from '../api/restaurant';
import { menuService, type MenuItem } from '../api/menu';
import FoodAppNavbar from '../components/FoodAppNavbar';

gsap.registerPlugin(ScrollTrigger);

const CUISINES = [
  { name: 'North Indian', emoji: '🍛', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', count: 150 },
  { name: 'South Indian', emoji: '🥘', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80', count: 120 },
  { name: 'Chinese', emoji: '🥢', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80', count: 95 },
  { name: 'Italian', emoji: '🍝', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80', count: 80 },
  { name: 'Mexican', emoji: '🌮', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80', count: 60 },
  { name: 'Japanese', emoji: '🍱', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80', count: 70 },
  { name: 'Continental', emoji: '🥗', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', count: 85 },
  { name: 'Desserts', emoji: '🍮', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', count: 110 },
];

const FEATURED_DISHES = [
  { name: 'Butter Chicken', cuisine: 'North Indian', price: 349, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80' },
  { name: 'Masala Dosa', cuisine: 'South Indian', price: 149, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80' },
  { name: 'Pad Thai', cuisine: 'Asian', price: 299, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80' },
  { name: 'Margherita Pizza', cuisine: 'Italian', price: 299, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
  { name: 'Sushi Platter', cuisine: 'Japanese', price: 599, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80' },
  { name: 'Tacos al Pastor', cuisine: 'Mexican', price: 249, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80' },
  { name: 'Tiramisu', cuisine: 'Dessert', price: 199, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80' },
  { name: 'Biryani', cuisine: 'Indian', price: 329, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
];

export default function CinematicLanding() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [navbarVisible, setNavbarVisible] = useState(false);
  const navigate = useNavigate();

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const cuisineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const dishesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch data
    Promise.all([
      restaurantService.getAllRestaurants(),
      menuService.searchMenuItems('a')
    ])
      .then(([restaurantsData, dishesData]) => {
        setRestaurants(restaurantsData);
        setDishes(dishesData);
      })
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      const heroTl = gsap.timeline();
      
      // Staggered word reveal
      heroTl.from('.hero-word', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      })
      .from('.hero-subtext', {
        y: 30,
        opacity: 0,
        duration: 0.6,
      }, '-=0.3')
      .from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      }, '-=0.2')
      .from('.hero-badge', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      }, '-=0.3');

      // Floating badges animation
      gsap.to('.float-badge-1', {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.float-badge-2', {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5,
      });

      gsap.to('.float-badge-3', {
        y: -18,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });

      // Background blobs animation
      gsap.to('.blob-1', {
        scale: 1.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.blob-2', {
        scale: 1.15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });

      // Horizontal scroll cuisine section
      if (cuisineRef.current) {
        const cuisineCards = gsap.utils.toArray('.cuisine-card');
        
        gsap.to(cuisineCards, {
          xPercent: -100 * (cuisineCards.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: cuisineRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (cuisineCards.length - 1),
            end: () => `+=${cuisineRef.current!.offsetWidth * cuisineCards.length}`,
          },
        });
      }

      // Stats counter animation
      if (statsRef.current) {
        const stats = gsap.utils.toArray('.stat-number');
        
        stats.forEach((stat: any) => {
          const target = parseInt(stat.getAttribute('data-target'));
          const obj = { val: 0 };
          
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
            },
            onUpdate: () => {
              stat.textContent = Math.ceil(obj.val).toLocaleString();
            },
          });
        });
      }

      // Parallax dishes grid
      if (dishesRef.current) {
        gsap.utils.toArray('.dish-card').forEach((card: any, i) => {
          gsap.from(card, {
            y: 100,
            opacity: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
          });

          // Parallax effect
          gsap.to(card, {
            y: -50 * (i % 2 === 0 ? 1 : -1),
            ease: 'none',
            scrollTrigger: {
              trigger: dishesRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        });
      }

      // Navbar scroll trigger
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onUpdate: (self) => {
          setNavbarVisible(self.direction === -1 || self.progress > 0.05);
        },
      });

    });

    return () => ctx.revert();
  }, [loading]);

  return (
    <div className="cinematic-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Nunito:wght@400;600;700;800;900&display=swap');

        .cinematic-landing {
          font-family: 'Nunito', sans-serif;
          background: #ffffff;
          overflow-x: hidden;
        }

        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        .hero-section {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 100%);
          position: relative;
          overflow: hidden;
        }

        .blob-1, .blob-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #e8001d 0%, transparent 70%);
          top: 10%;
          right: 10%;
        }

        .blob-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #e8001d 0%, transparent 70%);
          bottom: 10%;
          left: 10%;
        }

        .floating-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 12px 20px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
        }

        .cuisine-scroll-section {
          background: #0d0d0d;
          overflow: hidden;
        }

        .cuisine-card {
          flex-shrink: 0;
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .cuisine-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cuisine-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 60px;
        }

        .stats-section {
          background: #111;
          color: #fff;
          padding: 80px 20px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 48px;
          font-weight: 900;
          color: #e8001d;
          font-family: 'Playfair Display', serif;
        }

        .dish-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .dish-card:hover {
          transform: scale(1.05);
        }

        .dish-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dish-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }

        .sticky-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding: 16px 40px;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }

        .sticky-navbar.visible {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .cuisine-overlay {
            padding: 30px;
          }
          
          .stat-number {
            font-size: 36px;
          }
        }
      `}</style>

      {/* Sticky Navbar */}
      <nav className={`sticky-navbar ${navbarVisible ? 'visible' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-playfair text-2xl font-black" style={{ color: '#e8001d' }}>
            QuickBite
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-700">
            <Link to="/" className="hover:text-red-600 transition">Home</Link>
            <Link to="/restaurants" className="hover:text-red-600 transition">Cuisines</Link>
            <Link to="/restaurants" className="hover:text-red-600 transition">Offers</Link>
            <Link to="/about" className="hover:text-red-600 transition">About</Link>
          </div>
          <Link
            to="/restaurants"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition"
          >
            Order Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section flex items-center justify-center px-6 relative">
        {/* Animated blobs */}
        <div className="blob-1" />
        <div className="blob-2" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Text Content */}
          <div>
            <h1 className="font-playfair text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              <div className="hero-word">Taste the</div>
              <div className="hero-word">World,</div>
              <div className="hero-word" style={{ color: '#e8001d' }}>Delivered</div>
              <div className="hero-word">to Your Door.</div>
            </h1>

            <p className="hero-subtext text-xl text-gray-300 mb-8 max-w-xl">
              From street food to fine dining — hot, fresh, and in 30 minutes.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                to="/restaurants"
                className="hero-cta bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition inline-flex items-center gap-2"
              >
                Order Now <ArrowRight size={20} />
              </Link>
              <Link
                to="/restaurants"
                className="hero-cta border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition"
              >
                Explore Menu
              </Link>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="hero-badge float-badge-1 floating-badge">
                <Star size={18} fill="#f5a623" color="#f5a623" />
                <span>4.9 — Rated by 50,000+ foodies</span>
              </div>
              <div className="hero-badge float-badge-2 floating-badge">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>2,400 orders delivered today</span>
              </div>
              <div className="hero-badge float-badge-3 floating-badge">
                <Clock size={18} />
                <span>Avg. 28 min delivery</span>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="hidden lg:block relative">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
              alt="Delicious food"
              className="rounded-3xl shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-sm font-bold animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span>Scroll to explore</span>
            <ArrowRight size={20} className="rotate-90" />
          </div>
        </div>
      </section>

      {/* To be continued in next part... */}
      
      {/* Cuisine Horizontal Scroll */}
      <section ref={cuisineRef} className="cuisine-scroll-section">
        <div className="flex">
          {CUISINES.map((cuisine, i) => (
            <div key={i} className="cuisine-card">
              <img src={cuisine.image} alt={cuisine.name} loading="lazy" />
              <div className="cuisine-overlay">
                <h2 className="font-playfair text-6xl font-black text-white mb-4">
                  {cuisine.emoji} {cuisine.name}
                </h2>
                <p className="text-xl text-gray-300 mb-6">{cuisine.count}+ dishes available</p>
                <Link
                  to={`/restaurants?cuisine=${cuisine.name}`}
                  className="bg-red-600 text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-red-700 transition w-fit"
                >
                  Explore {cuisine.name} <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="stats-section">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="stat-item">
            <div className="stat-number" data-target="50000">0</div>
            <div className="text-gray-400 font-bold mt-2">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="{restaurants.length || 300}">0</div>
            <div className="text-gray-400 font-bold mt-2">Restaurant Partners</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="28">0</div>
            <div className="text-gray-400 font-bold mt-2">Min Avg. Delivery</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="49">0</div>
            <div className="text-gray-400 font-bold mt-2">★ Average Rating</div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section ref={dishesRef} className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair text-5xl font-black text-center mb-4">Today's Must-Try Dishes</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Handpicked by our chefs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_DISHES.map((dish, i) => (
              <div key={i} className="dish-card h-80">
                <img src={dish.image} alt={dish.name} loading="lazy" />
                <div className="dish-overlay">
                  <span className="text-xs font-bold text-gray-300 mb-2">{dish.cuisine}</span>
                  <h3 className="font-playfair text-2xl font-bold text-white mb-2">{dish.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">₹{dish.price}</span>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-700 transition">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants from DB */}
      {!loading && restaurants.length > 0 && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-playfair text-5xl font-black text-center mb-4">Top Restaurants in Bhopal</h2>
            <p className="text-center text-gray-600 mb-12 text-lg">Delivering happiness to your doorstep</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={`/menu/${restaurant.id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1">
                      <Star size={14} fill="#f5a623" color="#f5a623" />
                      <span className="text-sm font-bold">{restaurant.rating || 4.5}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-playfair text-2xl font-bold mb-2">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{restaurant.cuisineType}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {restaurant.estimatedDeliveryMin || 30} mins
                      </span>
                      <span className="font-bold text-red-600">₹{restaurant.deliveryFee || 35} delivery</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #e8001d 0%, #c00018 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="font-playfair text-5xl font-black mb-4">🔥 50% OFF your first order</h2>
          <p className="text-2xl mb-8 opacity-90">Use code <span className="font-black">HUNGRY50</span></p>
          <Link
            to="/restaurants"
            className="bg-white text-red-600 px-10 py-5 rounded-full font-black text-xl hover:scale-105 transition inline-flex items-center gap-3"
          >
            Claim Offer <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-playfair text-2xl font-black mb-4" style={{ color: '#e8001d' }}>QuickBite</h3>
            <p className="text-gray-400 text-sm">Delivering happiness, one meal at a time.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>About Us</div>
              <div>Careers</div>
              <div>Partner with Us</div>
              <div>Contact</div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Terms & Conditions</div>
              <div>Privacy Policy</div>
              <div>Refund Policy</div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Instagram</div>
              <div>Facebook</div>
              <div>Twitter</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © 2024 QuickBite. Made with ❤️ for food lovers in Bhopal.
        </div>
      </footer>
      
      <FoodAppNavbar />
    </div>
  );
}
