import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Store, MapPin, CheckCircle2, ChevronRight, SlidersHorizontal, Percent } from 'lucide-react';
import { restaurantService, type Restaurant } from '../../api/restaurant';

export default function AdminApprovals() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
  
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getAllRestaurantsForAdmin();
      setRestaurants(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    if (activeTab === 'pending') result = result.filter(r => !r.isApproved);
    if (activeTab === 'active') result = result.filter(r => r.isApproved);
    
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(r => 
        [r.name, r.cuisineType, r.city].filter(Boolean).some(val => val!.toLowerCase().includes(query))
      );
    }
    return result;
  }, [restaurants, activeTab, search]);

  const handleApprove = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActionId(id);
    try {
      const updated = await restaurantService.approveRestaurant(id);
      setRestaurants(current => current.map(r => r.id === id ? updated : r));
    } catch (err: any) {
      console.error(err);
      setError('Approval failed: ' + err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActionId(id);
    try {
      // Simulate suspend API call as it doesn't exist
      await new Promise(r => setTimeout(r, 800));
      setRestaurants(current => current.map(r => r.id === id ? { ...r, isActive: false } : r));
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-[1600px]">
        <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="h-[600px] bg-white rounded-[2.5rem] shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-[1600px]">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Partner Directory</h1>
          <p className="text-slate-500 font-medium">Review onboarding requests, adjust commission rates, and manage active restaurant partners.</p>
        </div>
        <div className="relative w-full max-w-md group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant name or city..."
            className="w-full rounded-full bg-white border border-slate-200 px-12 py-3.5 text-sm font-medium outline-none transition-all focus:border-amber-300 focus:ring-4 focus:ring-amber-500/10 shadow-sm text-slate-700"
          />
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'pending' 
              ? 'text-amber-600 border-b-2 border-amber-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Pending Approvals ({restaurants.filter(r => !r.isApproved).length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'active' 
              ? 'text-indigo-600 border-b-2 border-indigo-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active Partners ({restaurants.filter(r => r.isApproved).length})
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {filteredRestaurants.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Store size={48} className="opacity-20 mb-4" />
            <p className="font-display text-xl font-black text-slate-700">No restaurants found</p>
          </div>
        ) : (
          filteredRestaurants.map(restaurant => (
            <div key={restaurant.id} className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all flex flex-col">
              
              <div className="relative h-40 overflow-hidden bg-slate-100">
                {restaurant.imageUrl ? (
                  <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Store size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-xl font-black line-clamp-1">{restaurant.name}</h3>
                  <p className="text-xs font-medium text-slate-300 flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {restaurant.address}, {restaurant.city}
                  </p>
                </div>
                {!restaurant.isApproved && (
                  <span className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    Pending
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                      {restaurant.cuisineType || 'Various'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Percent size={12} /> Comm: 15%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{restaurant.description || 'No description provided.'}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  {!restaurant.isApproved ? (
                    <button 
                      onClick={(e) => handleApprove(e, restaurant.id)}
                      disabled={actionId === restaurant.id}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionId === restaurant.id ? 'Approving...' : 'Approve Partner'}
                    </button>
                  ) : (
                    <>
                      <button className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <SlidersHorizontal size={14} /> Adjust Config
                      </button>
                      <button 
                        onClick={(e) => handleSuspend(e, restaurant.id)}
                        disabled={actionId === restaurant.id}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                          restaurant.isActive 
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {restaurant.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
