import { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, Filter, X, Star, Clock, Flame, Leaf, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { menuService, type MenuItem } from '../../api/menu';
import { restaurantService, type Restaurant } from '../../api/restaurant';

const CUISINE_FILTERS = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food', 'Desserts', 'Beverages'];
const DIETARY_FILTERS = ['All', 'Vegetarian', 'Non-Vegetarian'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Popular'];

export default function SearchDishes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [allDishes, setAllDishes] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    loadAllDishes();
  }, []);

  const loadAllDishes = async () => {
    setLoading(true);
    try {
      // Fetch all restaurants for mapping
      const allRestaurants = await restaurantService.getAllRestaurants();
      const restaurantMap = new Map(allRestaurants.map(r => [r.id, r]));
      setRestaurants(restaurantMap);

      // Fetch all dishes directly
      const dishes = await menuService.getAllDishes();
      setAllDishes(dishes);
    } catch (error) {
      console.error('Failed to load dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedDishes = useMemo(() => {
    let filtered = allDishes.filter(dish => {
      // Search query
      if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !dish.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Cuisine filter
      if (selectedCuisine !== 'All') {
        const restaurant = restaurants.get(dish.restaurantId);
        if (!restaurant || restaurant.cuisineType !== selectedCuisine) {
          return false;
        }
      }

      // Dietary filter
      if (selectedDietary === 'Vegetarian' && !dish.isVegetarian) return false;
      if (selectedDietary === 'Non-Vegetarian' && dish.isVegetarian) return false;

      // Price range
      const price = dish.discountedPrice || dish.price;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'Price: Low to High':
        filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case 'Rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Popular':
        filtered.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        break;
    }

    return filtered;
  }, [allDishes, searchQuery, selectedCuisine, selectedDietary, sortBy, priceRange, restaurants]);

  const handleDishClick = (dish: MenuItem) => {
    navigate(`/item/${dish.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="skeleton h-12 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-48 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dishes, cuisines..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
                showFilters
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cuisine */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Cuisine</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
                  >
                    {CUISINE_FILTERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Dietary */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Dietary</label>
                  <select
                    value={selectedDietary}
                    onChange={(e) => setSelectedDietary(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
                  >
                    {DIETARY_FILTERS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
                  >
                    {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            {filteredAndSortedDishes.length} dishes found
          </p>
          {(searchQuery || selectedCuisine !== 'All' || selectedDietary !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('All');
                setSelectedDietary('All');
                setPriceRange([0, 1000]);
              }}
              className="text-sm font-bold text-red-600 hover:text-red-700"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredAndSortedDishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <SearchIcon size={48} className="text-gray-400" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-black text-gray-900">No dishes found</h3>
            <p className="text-sm text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedDishes.map((dish) => {
              const restaurant = restaurants.get(dish.restaurantId);
              const price = dish.discountedPrice || dish.price;
              const hasDiscount = dish.discountedPrice && dish.discountedPrice < dish.price;

              return (
                <div
                  key={dish.id}
                  onClick={() => handleDishClick(dish)}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {dish.isVegetarian && (
                        <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                          <Leaf size={12} />
                        </span>
                      )}
                      {dish.isSpicy && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                          <Flame size={12} />
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <div className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        {Math.round(((dish.price - dish.discountedPrice!) / dish.price) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-black text-gray-900 line-clamp-1">{dish.name}</h3>
                      {dish.rating && dish.rating > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
                          <Star size={12} className="text-green-600" fill="currentColor" />
                          <span className="text-xs font-bold text-green-600">{dish.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <p className="mb-3 text-xs text-gray-600 line-clamp-2">{dish.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-black text-gray-900">₹{price}</span>
                        {hasDiscount && (
                          <span className="text-sm font-semibold text-gray-400 line-through">₹{dish.price}</span>
                        )}
                      </div>
                      
                      {dish.preparationTime && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                          <Clock size={12} />
                          {dish.preparationTime}m
                        </div>
                      )}
                    </div>

                    {restaurant && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500">
                          From <span className="text-gray-900">{restaurant.name}</span>
                        </p>
                      </div>
                    )}

                    {dish.orderCount && dish.orderCount > 50 && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-600">
                        <TrendingUp size={12} />
                        Popular ({dish.orderCount}+ orders)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
