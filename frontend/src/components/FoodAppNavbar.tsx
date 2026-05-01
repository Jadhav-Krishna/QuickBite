import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

export default function FoodAppNavbar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="icon-fill" d="M3 10L12 3l9 7v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10z"/>
          <path className="icon-stroke" d="M9 21V12h6v9" strokeWidth="2.2"/>
        </svg>
      ),
    },
    {
      label: 'Search',
      path: '/search',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
          <circle className="icon-stroke" cx="11" cy="11" r="7"/>
          <line className="icon-stroke" x1="16.5" y1="16.5" x2="22" y2="22"/>
        </svg>
      ),
    },
    {
      label: 'Restaurants',
      path: '/restaurants',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="icon-stroke" d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
          <line className="icon-stroke" x1="7" y1="2" x2="7" y2="22"/>
          <path className="icon-stroke" d="M21 15V2a5 5 0 00-5 5v6h3.5M19.5 13V22"/>
        </svg>
      ),
    },
    {
      label: 'Orders',
      path: '/customer/history',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="icon-stroke" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line className="icon-stroke" x1="3" y1="6" x2="21" y2="6"/>
          <path className="icon-stroke" d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      label: 'Profile',
      path: user ? '/profile' : '/login',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round">
          <circle className="icon-stroke" cx="12" cy="8" r="4"/>
          <path className="icon-stroke" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const index = NAV_ITEMS.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .navbar-wrap {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 450px;
          z-index: 999;
        }

        .navbar {
          background: #fff;
          border-radius: 50px;
          padding: 14px 20px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 24px;
          transition: all 0.2s ease;
          position: relative;
          text-decoration: none;
          min-width: 60px;
        }
        .nav-item:hover {
          background: rgba(232,0,29,0.08);
          transform: translateY(-2px);
        }

        .nav-label {
          font-size: 11px;
          font-weight: 800;
          color: #999;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.3px;
        }
        .nav-item.active .nav-label {
          color: #e8001d;
        }

        .nav-item svg {
          width: 26px;
          height: 26px;
          transition: all 0.2s;
        }

        /* default icon color */
        .nav-item svg .icon-stroke {
          stroke: #999;
          transition: stroke 0.2s;
          stroke-width: 2.4;
        }
        .nav-item svg .icon-fill {
          fill: none;
          transition: fill 0.2s, stroke 0.2s;
          stroke-width: 2.4;
        }

        /* active icon color */
        .nav-item.active svg .icon-stroke {
          stroke: #e8001d;
          stroke-width: 2.6;
        }
        .nav-item.active svg .icon-fill {
          fill: #e8001d;
          stroke: #e8001d;
          stroke-width: 2.6;
        }

        /* hover icon color */
        .nav-item:hover svg .icon-stroke {
          stroke: #ff1a33;
        }

        /* active dot */
        .nav-dot {
          width: 6px;
          height: 6px;
          background: #e8001d;
          border-radius: 50%;
          position: absolute;
          bottom: 2px;
          opacity: 0;
          transition: opacity 0.2s;
          box-shadow: 0 2px 6px rgba(232,0,29,0.4);
        }
        .nav-item.active .nav-dot {
          opacity: 1;
        }

        /* Badge for cart */
        .nav-badge {
          position: absolute;
          top: 4px;
          right: 10px;
          background: #e8001d;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          padding: 3px 6px;
          border-radius: 12px;
          min-width: 18px;
          text-align: center;
          box-shadow: 0 3px 8px rgba(232,0,29,0.5);
          font-family: 'Nunito', sans-serif;
        }

        /* Active item background glow */
        .nav-item.active {
          background: rgba(232,0,29,0.06);
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .navbar-wrap {
            width: calc(100% - 28px);
            max-width: 100%;
            bottom: 16px;
          }
          
          .navbar {
            padding: 12px 16px;
            border-radius: 45px;
          }
          
          .nav-item {
            padding: 7px 11px;
            min-width: 54px;
          }
          
          .nav-item svg {
            width: 24px;
            height: 24px;
          }
          
          .nav-label {
            font-size: 10px;
          }

          .nav-badge {
            font-size: 9px;
            padding: 2px 5px;
            min-width: 16px;
          }
        }

        @media (max-width: 360px) {
          .nav-item {
            padding: 6px 8px;
            min-width: 48px;
          }
          
          .nav-item svg {
            width: 22px;
            height: 22px;
          }
          
          .nav-label {
            font-size: 9px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .navbar {
            background: #1a1a1a;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2);
          }
          
          .nav-label {
            color: #666;
          }
          
          .nav-item.active .nav-label {
            color: #ff2d47;
          }
          
          .nav-item svg .icon-stroke {
            stroke: #666;
          }
          
          .nav-item.active svg .icon-stroke {
            stroke: #ff2d47;
          }
          
          .nav-item.active svg .icon-fill {
            fill: #ff2d47;
            stroke: #ff2d47;
          }
          
          .nav-item:hover {
            background: rgba(255,45,71,0.12);
          }
          
          .nav-item.active {
            background: rgba(255,45,71,0.1);
          }
          
          .nav-dot {
            background: #ff2d47;
          }
          
          .nav-badge {
            background: #ff2d47;
          }
        }
      `}</style>

      <div className="navbar-wrap">
        <nav className="navbar">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.label}
              to={item.path}
              className={`nav-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
              <div className="nav-dot" />
              
              {/* Show badge on Orders tab */}
              {item.label === 'Orders' && totalItems > 0 && (
                <span className="nav-badge">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
