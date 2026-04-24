import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MapPin, Bell, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  isCenter?: boolean;
  badge?: number;
}

export default function ModernFloatingNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const NAV_ITEMS: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Orders', path: '/customer/history', badge: totalItems },
    { icon: MapPin, label: 'Explore', path: '/restaurants', isCenter: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: user ? '/profile' : '/login' },
  ];

  useEffect(() => {
    const index = NAV_ITEMS.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [location.pathname]);

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[85%] md:w-[70%] lg:w-[500px] max-w-2xl"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Glassmorphism Container */}
      <div className="relative">
        {/* Background with gradient and blur */}
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full border border-white/20 dark:border-slate-700/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/10 to-red-500/5 rounded-full blur-xl" />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-between px-2 sm:px-4 py-3">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;
            const isCenter = item.isCenter;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setActiveIndex(index)}
                className="relative flex flex-col items-center justify-center flex-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-2xl py-2"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Background Circle */}
                <div
                  className={`
                    absolute inset-0 mx-auto rounded-2xl transition-all duration-300 ease-out
                    ${isActive && isCenter 
                      ? 'w-16 sm:w-20 bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50 scale-105' 
                      : isActive
                      ? 'w-14 sm:w-16 bg-red-50 dark:bg-red-950/50'
                      : 'w-0 opacity-0'
                    }
                  `}
                />

                {/* Hover Effect */}
                <div
                  className={`
                    absolute inset-0 mx-auto w-14 sm:w-16 rounded-2xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    ${!isActive && 'bg-slate-100 dark:bg-slate-800/50'}
                  `}
                />

                {/* Icon Container */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`
                      relative transition-all duration-300 ease-out
                      ${isActive && isCenter ? 'scale-125' : isActive ? 'scale-110' : 'scale-100'}
                      group-hover:scale-110
                    `}
                  >
                    <Icon
                      size={isCenter ? 26 : 22}
                      className={`
                        transition-all duration-300
                        ${isActive && isCenter
                          ? 'text-white stroke-[2.5]'
                          : isActive
                          ? 'text-red-600 dark:text-red-500 stroke-[2.5]'
                          : 'text-slate-400 dark:text-slate-500 stroke-[2] group-hover:text-red-500 dark:group-hover:text-red-400'
                        }
                      `}
                    />

                    {/* Badge for notifications/cart */}
                    {item.badge && item.badge > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-lg"
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[9px] sm:text-[10px] font-bold tracking-wide transition-all duration-300 whitespace-nowrap
                      ${isActive && isCenter
                        ? 'text-white opacity-100'
                        : isActive
                        ? 'text-red-600 dark:text-red-500 opacity-100'
                        : 'text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-red-500 dark:group-hover:text-red-400'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Center Icon Glow */}
                {isCenter && isActive && (
                  <div className="absolute inset-0 mx-auto w-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 blur-xl opacity-40" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Active Indicator Line - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-center px-2 sm:px-4">
          <div className="relative w-full flex">
            {NAV_ITEMS.map((item, index) => (
              <div key={index} className="flex-1 flex justify-center">
                <div
                  className={`
                    h-1 rounded-full transition-all duration-500 ease-out
                    ${activeIndex === index
                      ? item.isCenter
                        ? 'w-12 sm:w-16 bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/50'
                        : 'w-10 sm:w-12 bg-gradient-to-r from-red-500 to-rose-600'
                      : 'w-0 bg-transparent'
                    }
                  `}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
