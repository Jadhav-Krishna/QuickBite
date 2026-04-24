import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, UtensilsCrossed, ArrowUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/restaurants' },
  { icon: UtensilsCrossed, label: 'Menu', path: '/restaurants' },
  { icon: ShoppingBag, label: 'Cart', path: '/cart' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function FloatingNavbar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = NAV_ITEMS.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [location.pathname]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Navbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md md:max-w-lg">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 px-2 py-3">
          {/* Active indicator */}
          <div
            className="absolute top-0 left-0 w-10 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateX(${activeIndex * (100 / NAV_ITEMS.length)}%)`,
              marginLeft: `${(100 / NAV_ITEMS.length / 2) - 10}%`
            }}
          />

          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeIndex === index;
              const isCart = item.label === 'Cart';
              const isProfile = item.label === 'Profile';
              const targetPath = isProfile && !user ? '/login' : item.path;

              return (
                <Link
                  key={item.label}
                  to={targetPath}
                  className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 group"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      className={`transition-all duration-200 ${
                        isActive
                          ? 'text-red-600 scale-110'
                          : 'text-slate-400 group-hover:text-red-500 group-hover:scale-105'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isCart && totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold transition-all duration-200 ${
                      isActive
                        ? 'text-red-600 opacity-100'
                        : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-red-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 transition-all duration-300 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}
