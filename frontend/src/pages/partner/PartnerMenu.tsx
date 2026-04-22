import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Power, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type MenuCategory, type MenuItem } from '../../api/menu';

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { id: 1, restaurantId: 2, name: 'Biryani & Rice', description: '', displayOrder: 1, isActive: true },
  { id: 2, restaurantId: 2, name: 'Curries', description: '', displayOrder: 2, isActive: true },
];

const FALLBACK_ITEMS: MenuItem[] = [
  { id: 1, restaurantId: 2, categoryId: 1, name: 'Hyderabadi Chicken Dum Biryani', description: 'Slow-cooked aromatic basmati rice layered with marinated chicken.', price: 349, discountedPrice: 299, isVegetarian: false, isSpicy: true, preparationTime: 20, isAvailable: true, imageUrl: '', orderCount: 1240, rating: 4.8 },
  { id: 2, restaurantId: 2, categoryId: 2, name: 'Paneer Butter Masala', description: 'Soft cottage cheese cubes in a rich, creamy, and mildly sweet tomato gravy.', price: 279, discountedPrice: undefined, isVegetarian: true, isSpicy: false, preparationTime: 15, isAvailable: true, imageUrl: '', orderCount: 850, rating: 4.6 },
  { id: 3, restaurantId: 2, categoryId: 1, name: 'Veg Pulao', description: 'Mixed vegetables and rice cooked together.', price: 199, discountedPrice: undefined, isVegetarian: true, isSpicy: false, preparationTime: 15, isAvailable: false, imageUrl: '', orderCount: 300, rating: 4.1 },
];

export default function PartnerMenu() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCategories(FALLBACK_CATEGORIES);
      setItems(FALLBACK_ITEMS);
      setLoading(false);
    }, 800);
  }, [user?.userId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  const toggleAvailability = (item: MenuItem) => {
    setItems(prev => prev.map(current => current.id === item.id ? { ...current, isAvailable: !current.isAvailable } : current));
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-[var(--color-surface-variant)] rounded-lg mb-8" />
        <div className="flex gap-4">
          <div className="h-12 flex-1 bg-[var(--color-surface-variant)] rounded-full" />
          <div className="h-12 flex-1 bg-[var(--color-surface-variant)] rounded-full" />
        </div>
        <div className="h-96 bg-[var(--color-surface-variant)] rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black">Menu Management</h1>
          <p className="text-[var(--color-on-surface-variant)] font-medium">Manage dishes, availability, and pricing.</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105 active:scale-95">
          <Plus size={18} /> Add New Dish
        </button>
      </header>

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full rounded-full bg-white border border-[var(--color-outline-variant)]/40 px-12 py-3.5 text-sm font-medium outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_var(--color-primary-container)]"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="rounded-full bg-white border border-[var(--color-outline-variant)]/40 px-6 py-3.5 text-sm font-medium outline-none transition-all hover:border-[var(--color-primary)] cursor-pointer appearance-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* ── Menu Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const categoryName = categories.find((c) => c.id === item.categoryId)?.name || 'Uncategorized';
          
          return (
            <div key={item.id} className={`group relative rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 p-6 shadow-card transition-all hover:shadow-ambient ${!item.isAvailable ? 'opacity-75 grayscale-[0.2]' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  {categoryName}
                </span>
                
                {/* Custom Toggle Switch */}
                <button 
                  onClick={() => toggleAvailability(item)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${item.isVegetarian ? 'border-green-600' : 'border-red-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${item.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                </span>
                <h3 className="font-display text-xl font-bold line-clamp-1">{item.name}</h3>
              </div>
              
              <p className="text-sm font-medium text-[var(--color-on-surface-variant)] mb-4 line-clamp-2 h-10">
                {item.description}
              </p>

              <div className="flex items-end justify-between border-t border-[var(--color-surface-variant)] pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-black">₹{item.discountedPrice || item.price}</span>
                    {item.discountedPrice && (
                      <span className="text-sm font-bold text-[var(--color-on-surface-variant)] line-through">₹{item.price}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]">
                    <Edit3 size={16} />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-red-100 hover:text-red-600">
                    <Power size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-[var(--color-outline-variant)]/40 border-dashed">
          <p className="font-display text-xl font-bold">No dishes found</p>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
}