import { useEffect, useMemo, useState } from 'react';
import { Bike, CheckCircle2, MapPin, Power, Search, ShieldAlert, Store, UserCheck, UserX } from 'lucide-react';
import { authService, type UserDTO } from '../../api/auth';
import { restaurantService, type Restaurant } from '../../api/restaurant';

type ApprovalTab = 'pending' | 'approved';
type ApprovalDomain = 'restaurants' | 'agents';

const formatCuisines = (restaurant: Restaurant) => {
  if (Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0) {
    return restaurant.cuisines.join(', ');
  }

  if (typeof restaurant.cuisines === 'string' && restaurant.cuisines.trim()) {
    return restaurant.cuisines;
  }

  return restaurant.cuisineType || 'Various';
};

export default function AdminApprovals() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ApprovalTab>('pending');
  const [activeDomain, setActiveDomain] = useState<ApprovalDomain>('restaurants');
  const [actionKey, setActionKey] = useState<string | null>(null);

  useEffect(() => {
    void fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allRestaurants, allUsers] = await Promise.all([
        restaurantService.getAllRestaurantsForAdmin(),
        authService.getAllUsers(),
      ]);

      setRestaurants(allRestaurants);
      setDeliveryAgents(
        allUsers.filter((user) => user.role.toUpperCase().includes('DELIVERY_AGENT')),
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to load approvals data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;

    if (activeTab === 'pending') {
      result = result.filter((restaurant) => !restaurant.isApproved);
    } else {
      result = result.filter((restaurant) => restaurant.isApproved);
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return result;
    }

    return result.filter((restaurant) =>
      [restaurant.name, restaurant.cuisineType, restaurant.city, restaurant.address]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [activeTab, restaurants, search]);

  const filteredAgents = useMemo(() => {
    let result = deliveryAgents;

    if (activeTab === 'pending') {
      result = result.filter((agent) => !agent.isActive);
    } else {
      result = result.filter((agent) => agent.isActive);
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return result;
    }

    return result.filter((agent) =>
      [agent.fullName, agent.email, agent.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [activeTab, deliveryAgents, search]);

  const runRestaurantAction = async (
    key: string,
    restaurantId: number,
    action: () => Promise<Restaurant>,
    fallbackError: string,
  ) => {
    setActionKey(key);
    setError(null);

    try {
      const updatedRestaurant = await action();
      setRestaurants((current) =>
        current.map((restaurant) =>
          restaurant.id === restaurantId ? updatedRestaurant : restaurant,
        ),
      );
    } catch (err: any) {
      setError(err?.message || fallbackError);
    } finally {
      setActionKey(null);
    }
  };

  const runAgentAction = async (
    key: string,
    userId: number,
    action: () => Promise<{ message: string }>,
    makeActive: boolean,
    fallbackError: string,
  ) => {
    setActionKey(key);
    setError(null);

    try {
      await action();
      setDeliveryAgents((current) =>
        current.map((agent) =>
          agent.userId === userId ? { ...agent, isActive: makeActive } : agent,
        ),
      );
    } catch (err: any) {
      setError(err?.message || fallbackError);
    } finally {
      setActionKey(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="h-[600px] rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] space-y-8 animate-fade-up">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Approvals Center</h1>
          <p className="font-medium text-slate-500">Approve restaurants and delivery agents with live status controls.</p>
        </div>
        <div className="group relative w-full max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeDomain === 'restaurants'
                ? 'Search by restaurant name or city...'
                : 'Search by agent name, email, or phone...'
            }
            className="w-full rounded-full border border-slate-200 bg-white px-12 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-amber-300 focus:ring-4 focus:ring-amber-500/10"
          />
        </div>
      </header>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <ShieldAlert size={18} /> {error}
        </div>
      ) : null}

      <div className="flex items-center gap-4 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveDomain('restaurants')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition ${
            activeDomain === 'restaurants'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Restaurants
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('agents')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition ${
            activeDomain === 'agents'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Delivery Agents
        </button>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition ${
            activeTab === 'pending'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Pending (
          {activeDomain === 'restaurants'
            ? restaurants.filter((restaurant) => !restaurant.isApproved).length
            : deliveryAgents.filter((agent) => !agent.isActive).length}
          )
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition ${
            activeTab === 'approved'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Approved (
          {activeDomain === 'restaurants'
            ? restaurants.filter((restaurant) => restaurant.isApproved).length
            : deliveryAgents.filter((agent) => agent.isActive).length}
          )
        </button>
      </div>

      {activeDomain === 'restaurants' ? (
        <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRestaurants.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <Store size={48} className="mb-4 opacity-20" />
              <p className="font-display text-xl font-black text-slate-700">No restaurants found</p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => {
              const approveKey = `approve-${restaurant.id}`;
              const activeKey = `active-${restaurant.id}`;
              const openKey = `open-${restaurant.id}`;

              return (
                <div key={restaurant.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-slate-200/60">
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {restaurant.imageUrl ? (
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Store size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-display text-xl font-black">{restaurant.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-200">
                        <MapPin size={12} /> {restaurant.address}, {restaurant.city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                        {restaurant.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${restaurant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${restaurant.isOpen ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'}`}>
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cuisine</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{formatCuisines(restaurant)}</p>
                    </div>

                    <p className="text-sm text-slate-500">
                      {restaurant.description || 'No description provided yet.'}
                    </p>

                    {!restaurant.isApproved ? (
                      <button
                        type="button"
                        onClick={() =>
                          void runRestaurantAction(
                            approveKey,
                            restaurant.id,
                            () => restaurantService.approveRestaurant(restaurant.id),
                            'Approval failed.',
                          )
                        }
                        disabled={actionKey === approveKey}
                        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                      >
                        {actionKey === approveKey ? 'Approving...' : 'Approve Partner'}
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            void runRestaurantAction(
                              openKey,
                              restaurant.id,
                              () => restaurantService.toggleRestaurantOpen(restaurant.id),
                              'Unable to update open status.',
                            )
                          }
                          disabled={actionKey === openKey}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {actionKey === openKey ? 'Updating...' : restaurant.isOpen ? 'Mark Closed' : 'Mark Open'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void runRestaurantAction(
                              activeKey,
                              restaurant.id,
                              () => restaurantService.toggleRestaurantActive(restaurant.id),
                              'Unable to update partner status.',
                            )
                          }
                          disabled={actionKey === activeKey}
                          className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${
                            restaurant.isActive
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {actionKey === activeKey ? (
                            'Updating...'
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Power size={14} />
                              {restaurant.isActive ? 'Deactivate' : 'Activate'}
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Rating {restaurant.rating?.toFixed(1) || '0.0'} from {restaurant.reviewCount || 0} reviews
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <Bike size={48} className="mb-4 opacity-20" />
              <p className="font-display text-xl font-black text-slate-700">No delivery agents found</p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const approveKey = `approve-agent-${agent.userId}`;
              const suspendKey = `suspend-agent-${agent.userId}`;

              return (
                <div key={agent.userId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-slate-200/60">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Bike size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-black text-slate-900">{agent.fullName}</h3>
                      <p className="text-xs font-semibold text-slate-500">{agent.email}</p>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      Delivery Agent
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        agent.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {agent.isActive ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>

                  <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    Phone: {agent.phone || 'N/A'}
                  </div>

                  {!agent.isActive ? (
                    <button
                      type="button"
                      onClick={() =>
                        void runAgentAction(
                          approveKey,
                          agent.userId,
                          () => authService.reactivateUser(agent.userId),
                          true,
                          'Unable to approve delivery agent.',
                        )
                      }
                      disabled={actionKey === approveKey}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <UserCheck size={15} />
                      {actionKey === approveKey ? 'Approving...' : 'Approve Agent'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        void runAgentAction(
                          suspendKey,
                          agent.userId,
                          () => authService.suspendUser(agent.userId),
                          false,
                          'Unable to suspend delivery agent.',
                        )
                      }
                      disabled={actionKey === suspendKey}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <UserX size={15} />
                      {actionKey === suspendKey ? 'Updating...' : 'Suspend Agent'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
