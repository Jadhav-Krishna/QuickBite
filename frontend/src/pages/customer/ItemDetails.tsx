import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { menuService, type MenuItem } from '../../api/menu';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { useCart } from '../../context/CartContext';
import { Loader2, Star, Clock, Flame, Leaf } from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        setLoading(true);
        console.log('Fetching dish with ID:', id);
        const data = await menuService.getMenuItemById(Number(id));
        console.log('Fetched dish data:', data);
        setItem(data);

        // Fetch restaurant details
        const restaurantData = await restaurantService.getRestaurantById(data.restaurantId);
        setRestaurant(restaurantData);

        // Fetch recommendations from same restaurant
        const allItems = await menuService.getMenuByRestaurant(data.restaurantId);
        const filtered = allItems
          .filter(i => i.id !== data.id && i.isAvailable)
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          .slice(0, 4);
        setRecommendations(filtered);
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    addToCart({
      id: item.id,
      name: item.name,
      price: item.discountedPrice || item.price,
      quantity,
      restaurantId: item.restaurantId,
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Item not found</h2>
        <Link to="/customer/search" className="text-[var(--color-primary)] hover:underline">
          Back to Search
        </Link>
      </div>
    );
  }

  const tags = [];
  if (item.isVegetarian) tags.push('Vegetarian');
  if (item.isSpicy) tags.push('Spicy');
  if (item.discountedPrice) tags.push('Special Offer');

  const displayPrice = item.discountedPrice || item.price;
  const totalPrice = displayPrice * quantity;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-4"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="w-full h-80 md:h-[500px] rounded-[2rem] overflow-hidden shadow-ambient relative">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">Currently Unavailable</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            {tags.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[var(--color-surface-container-highest)] rounded-full text-xs font-bold text-[var(--color-on-surface-variant)]">{tag}</span>
                ))}
              </div>
            )}
            <h1 className="font-display font-bold text-5xl mb-4">{item.name}</h1>
            <p className="font-sans text-[var(--color-on-surface-variant)] text-lg leading-relaxed">{item.description}</p>
            {item.preparationTime && (
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-4">
                ⏱️ Preparation time: {item.preparationTime} mins
              </p>
            )}
          </div>

          <div className="pt-8 border-t border-[var(--color-surface-variant)]">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-serif text-3xl font-bold">₹{displayPrice.toFixed(2)}</h3>
              {item.discountedPrice && (
                <span className="text-lg text-[var(--color-on-surface-variant)] line-through">₹{item.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-4 bg-[var(--color-surface-container-high)] px-4 py-2 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-white transition-colors"
                  disabled={!item.isAvailable}
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-white transition-colors"
                  disabled={!item.isAvailable}
                >
                  +
                </button>
              </div>
              <p className="font-sans text-sm text-[var(--color-on-surface-variant)]">Total: ₹{totalPrice.toFixed(2)}</p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
            >
              {item.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      {restaurant && (
        <div className="mt-12 pt-8 border-t border-[var(--color-surface-variant)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">From {restaurant.name}</h2>
              <div className="flex items-center gap-4 text-sm text-[var(--color-on-surface-variant)]">
                {restaurant.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" fill="currentColor" />
                    <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                )}
                <span>{restaurant.cuisineType}</span>
                {restaurant.estimatedDeliveryMin && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{restaurant.estimatedDeliveryMin} mins</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/menu/${restaurant.id}`)}
              className="px-4 py-2 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              View Full Menu
            </button>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl font-bold mb-6">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const recPrice = rec.discountedPrice || rec.price;
              const hasDiscount = rec.discountedPrice && rec.discountedPrice < rec.price;
              
              return (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/item/${rec.id}`)}
                  className="group flex gap-4 p-4 rounded-2xl border border-[var(--color-surface-variant)] bg-white hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={rec.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {hasDiscount && (
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {Math.round(((rec.price - rec.discountedPrice!) / rec.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {rec.isVegetarian ? (
                        <Leaf size={14} className="text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-red-600 rounded-sm mt-1 flex-shrink-0">
                          <div className="w-full h-full bg-red-600 rounded-full scale-75" />
                        </div>
                      )}
                      <h4 className="font-bold text-sm line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {rec.name}
                      </h4>
                      {rec.isSpicy && <Flame size={12} className="text-orange-500 mt-1 flex-shrink-0" />}
                    </div>
                    
                    <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2 mb-2">
                      {rec.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-base">₹{recPrice.toFixed(0)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-[var(--color-on-surface-variant)] line-through">
                            ₹{rec.price.toFixed(0)}
                          </span>
                        )}
                      </div>
                      
                      {rec.rating && rec.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star size={10} className="text-yellow-500" fill="currentColor" />
                          <span className="font-semibold">{rec.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
