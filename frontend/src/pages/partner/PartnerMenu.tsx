import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Power, Edit3, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { menuService, type MenuCategory, type MenuItem } from '../../api/menu';
import { restaurantService } from '../../api/restaurant';
import ImageUpload from '../../components/ImageUpload';

type DishForm = {
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  preparationTime: string;
  categoryId: string;
  isVegetarian: boolean;
  isSpicy: boolean;
};

const EMPTY_DISH: DishForm = {
  name: '',
  description: '',
  price: '',
  discountedPrice: '',
  preparationTime: '20',
  categoryId: '',
  isVegetarian: false,
  isSpicy: false,
};

export default function PartnerMenu() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);

  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState<number | null>(null);
  const [dishForm, setDishForm] = useState<DishForm>(EMPTY_DISH);
  const [savingDish, setSavingDish] = useState(false);
  const [dishImageFile, setDishImageFile] = useState<File | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const loadMenu = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const restaurants = await restaurantService.getRestaurantsByOwner(user.userId);
      const rid = restaurants[0]?.id ?? null;
      setRestaurantId(rid);

      if (!rid) {
        setItems([]);
        setCategories([]);
        return;
      }

      const [menuItems, categoryData] = await Promise.all([
        menuService.getAllMenuByRestaurant(rid),
        menuService.getRestaurantCategories(rid),
      ]);
      setItems(menuItems);
      setCategories(categoryData.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load menu.');
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMenu();
  }, [user?.userId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  const openCreateDish = () => {
    setEditingDishId(null);
    setDishForm(EMPTY_DISH);
    setDishImageFile(null);
    setShowDishModal(true);
  };

  const openEditDish = (item: MenuItem) => {
    setEditingDishId(item.id);
    setDishImageFile(null);
    setDishForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      discountedPrice: String(item.discountedPrice ?? item.price),
      preparationTime: String(item.preparationTime),
      categoryId: String(item.categoryId ?? ''),
      isVegetarian: Boolean(item.isVegetarian),
      isSpicy: Boolean(item.isSpicy),
    });
    setShowDishModal(true);
  };

  const closeDishModal = () => {
    if (savingDish) return;
    setShowDishModal(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !newCategoryName.trim()) return;

    setSavingCategory(true);
    setError(null);
    try {
      const created = await menuService.createCategory({
        restaurantId,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        displayOrder: categories.length + 1,
      });
      setCategories((prev) => [...prev, created]);
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      if (!dishForm.categoryId) {
        setDishForm((prev) => ({ ...prev, categoryId: String(created.id) }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category.');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      setError('Create restaurant first.');
      return;
    }
    if (!dishForm.categoryId) {
      setError('Please select a category.');
      return;
    }

    setSavingDish(true);
    setError(null);
    try {
      let dishId: number;
      
      if (editingDishId) {
        const updated = await menuService.updateMenuItem(editingDishId, {
          name: dishForm.name.trim(),
          description: dishForm.description.trim(),
          price: Number(dishForm.price),
          discountedPrice: Number(dishForm.discountedPrice || dishForm.price),
          preparationTime: Number(dishForm.preparationTime),
        });
        dishId = editingDishId;
        setItems((prev) => prev.map((item) => (item.id === editingDishId ? { ...item, ...updated } : item)));
      } else {
        const created = await menuService.createMenuItem({
          restaurantId,
          categoryId: Number(dishForm.categoryId),
          name: dishForm.name.trim(),
          description: dishForm.description.trim(),
          price: Number(dishForm.price),
          discountedPrice: Number(dishForm.discountedPrice || dishForm.price),
          preparationTime: Number(dishForm.preparationTime),
          isVegetarian: dishForm.isVegetarian,
          isSpicy: dishForm.isSpicy,
        });
        dishId = created.id;
        setItems((prev) => [created, ...prev]);
      }
      
      // Upload image if selected
      if (dishImageFile) {
        try {
          const imageUrl = await menuService.uploadMenuItemImage(dishId, dishImageFile);
          setItems((prev) => prev.map((item) => (item.id === dishId ? { ...item, imageUrl } : item)));
        } catch (imgErr: unknown) {
          console.error('Image upload failed:', imgErr);
          setError('Dish saved but image upload failed: ' + (imgErr instanceof Error ? imgErr.message : 'Unknown error'));
        }
      }
      
      setShowDishModal(false);
      setDishForm(EMPTY_DISH);
      setDishImageFile(null);
      setEditingDishId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save dish.');
    } finally {
      setSavingDish(false);
    }
  };

  const handleDeleteDish = async (item: MenuItem) => {
    const confirmed = window.confirm(`Delete "${item.name}"?`);
    if (!confirmed) return;

    setSavingItemId(item.id);
    setError(null);
    try {
      await menuService.deleteMenuItem(item.id);
      setItems((prev) => prev.filter((current) => current.id !== item.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete dish.');
    } finally {
      setSavingItemId(null);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const nextState = !item.isAvailable;
    setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, isAvailable: nextState } : current)));
    try {
      await menuService.updateItemAvailability(item.id, nextState);
    } catch {
      setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, isAvailable: item.isAvailable } : current)));
      setError('Failed to update availability.');
    }
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

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-4xl font-black">Menu Management</h1>
        <div className="rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white p-8">
          <p className="font-semibold">Create a restaurant profile first to manage dishes and categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black">Menu Management</h1>
          <p className="text-[var(--color-on-surface-variant)] font-medium">Manage dishes, availability, and pricing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 px-6 py-3 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/10">
            <Plus size={16} /> Add Category
          </button>
          <button onClick={openCreateDish} className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105 active:scale-95">
            <Plus size={18} /> Add New Dish
          </button>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div> : null}

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const categoryName = categories.find((c) => c.id === item.categoryId)?.name || 'Uncategorized';

          return (
            <div key={item.id} className={`group relative rounded-[2rem] bg-white border border-[var(--color-outline-variant)]/40 shadow-card transition-all hover:shadow-ambient overflow-hidden ${!item.isAvailable ? 'opacity-75 grayscale-[0.2]' : ''}`}>
              {item.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              
              <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                  {categoryName}
                </span>

                <button
                  onClick={() => void toggleAvailability(item)}
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
                    {item.discountedPrice ? (
                      <span className="text-sm font-bold text-[var(--color-on-surface-variant)] line-through">₹{item.price}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEditDish(item)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => void handleDeleteDish(item)} disabled={savingItemId === item.id} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50">
                    <Power size={16} />
                  </button>
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-[var(--color-outline-variant)]/40 border-dashed">
          <p className="font-display text-xl font-bold">No dishes found</p>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">Try adjusting your search or category filters.</p>
        </div>
      ) : null}

      {showDishModal ? (
        <div className="fixed h-[90vh] bottom-0 right-0 top-0 left-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleDishSubmit} className="w-full max-w-2xl rounded-3xl border border-[var(--color-outline-variant)]/30 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-black">{editingDishId ? 'Edit Dish' : 'Add New Dish'}</h2>
              <button type="button" onClick={closeDishModal} className="rounded-full p-2 hover:bg-[var(--color-surface-container)]">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-semibold">
                <span className="mb-1.5 block">Dish Name*</span>
                <input required value={dishForm.name} onChange={(e) => setDishForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
              </label>
              <label className="text-sm font-semibold">
                <span className="mb-1.5 block">Category*</span>
                <select required value={dishForm.categoryId} onChange={(e) => setDishForm((prev) => ({ ...prev, categoryId: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                <span className="mb-1.5 block">Price*</span>
                <input type="number" min="1" step="0.01" required value={dishForm.price} onChange={(e) => setDishForm((prev) => ({ ...prev, price: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
              </label>
              <label className="text-sm font-semibold">
                <span className="mb-1.5 block">Discounted Price*</span>
                <input type="number" min="1" step="0.01" required value={dishForm.discountedPrice} onChange={(e) => setDishForm((prev) => ({ ...prev, discountedPrice: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
              </label>
              <label className="text-sm font-semibold">
                <span className="mb-1.5 block">Preparation Time (mins)*</span>
                <input type="number" min="1" required value={dishForm.preparationTime} onChange={(e) => setDishForm((prev) => ({ ...prev, preparationTime: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold">
              <span className="mb-1.5 block">Description*</span>
              <textarea required rows={3} value={dishForm.description} onChange={(e) => setDishForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
            </label>

            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">Dish Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setError('Image size must be less than 10MB');
                      return;
                    }
                    setDishImageFile(file);
                    setError(null);
                  }
                }}
                className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
              />
              {dishImageFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{dishImageFile.name} selected</span>
                </div>
              )}
            </div>


            <div className="mt-4 flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={dishForm.isVegetarian} onChange={(e) => setDishForm((prev) => ({ ...prev, isVegetarian: e.target.checked }))} />
                Vegetarian
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={dishForm.isSpicy} onChange={(e) => setDishForm((prev) => ({ ...prev, isSpicy: e.target.checked }))} />
                Spicy
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeDishModal} className="rounded-full border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={savingDish} className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {savingDish ? 'Saving...' : editingDishId ? 'Update Dish' : 'Create Dish'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showCategoryModal ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <form onSubmit={handleCreateCategory} className="w-full max-w-lg rounded-3xl border border-[var(--color-outline-variant)]/30 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-black">Add Category</h2>
              <button type="button" onClick={() => setShowCategoryModal(false)} className="rounded-full p-2 hover:bg-[var(--color-surface-container)]">
                <X size={18} />
              </button>
            </div>
            <label className="text-sm font-semibold">
              <span className="mb-1.5 block">Category Name*</span>
              <input required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              <span className="mb-1.5 block">Description</span>
              <textarea rows={3} value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className="w-full rounded-xl border border-[var(--color-outline-variant)]/40 px-4 py-3 text-sm" />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCategoryModal(false)} className="rounded-full border border-[var(--color-outline-variant)]/40 px-5 py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={savingCategory} className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {savingCategory ? 'Saving...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
