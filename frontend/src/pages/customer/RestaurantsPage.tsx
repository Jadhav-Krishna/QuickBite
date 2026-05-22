import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Bike, TrendingUp, Filter, X } from 'lucide-react';
import { restaurantService, type Restaurant } from '../../api/restaurant';

const CUISINE_TYPES = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food', 'Cafe', 'Desserts'];
const SORT_OPTIONS = ['Relevance', 'Rating', 'Delivery Time', 'Delivery Fee'];

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRestaurants = useMemo(() => {
    let filtered = restaurants.filter(restaurant => {
      // Search
      if (searchQuery && !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Cuisine filter
      if (selectedCuisine !== 'All' && restaurant.cuisineType !== selectedCuisine) {
        return false;
      }

      return restaurant.isActive && restaurant.isApproved;
    });

    // Sort
    switch (sortBy) {
      case 'Rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Delivery Time':
        filtered.sort((a, b) => (a.estimatedDeliveryMin || 30) - (b.estimatedDeliveryMin || 30));
        break;
      case 'Delivery Fee':
        filtered.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0));
        break;
    }

    return filtered;
  }, [restaurants, searchQuery, selectedCuisine, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="skeleton h-12 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-80 rounded-3xl" />
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
          <h1 className="mb-4 font-display text-3xl font-black text-gray-900">
            Restaurants in <span className="text-red-600">Bhopal</span>
          </h1>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cuisine */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Cuisine Type</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
                  >
                    {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
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

                {/* Clear */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCuisine('All');
                      setSortBy('Relevance');
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-600">
            {filteredAndSortedRestaurants.length} restaurants available
          </p>
        </div>

        {filteredAndSortedRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-black text-gray-900">No restaurants found</h3>
            <p className="text-sm text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/menu/${restaurant.id}`)}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {restaurant.imageUrl ? (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-8xl">🍽️</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
                      restaurant.isOpen
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 text-white'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${restaurant.isOpen ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  {restaurant.rating && restaurant.rating > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-lg">
                      <Star size={14} className="text-yellow-500" fill="currentColor" />
                      <span className="text-sm font-bold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="mb-2 font-display text-xl font-black text-gray-900 line-clamp-1">
                    {restaurant.name}
                  </h3>

                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {restaurant.description || 'Delicious food awaits you'}
                  </p>

                  {/* Cuisine Tags */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      {restaurant.cuisineType}
                    </span>
                    {restaurant.reviewCount && restaurant.reviewCount > 0 && (
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {restaurant.reviewCount}+ reviews
                      </span>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                        <Clock size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Delivery</p>
                        <p className="text-sm font-bold text-gray-900">{restaurant.estimatedDeliveryMin || 30} mins</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                        <Bike size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">Fee</p>
                        <p className="text-sm font-bold text-gray-900">₹{restaurant.deliveryFee || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                    <MapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-600 line-clamp-2">
                      {restaurant.address}, {restaurant.city}
                    </p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
