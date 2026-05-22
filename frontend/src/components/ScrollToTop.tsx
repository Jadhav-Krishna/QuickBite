import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-6 z-[99] group"
      aria-label="Scroll to top"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
      
      {/* Button */}
      <div className="relative w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-500/60">
        <ArrowUp size={20} className="text-white" strokeWidth={2.5} />
      </div>
    </button>
  );
}
