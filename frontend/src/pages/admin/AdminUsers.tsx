import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Mail,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { authService, type UserDTO } from '../../api/auth';
import { orderService, type OrderDTO } from '../../api/order';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { useAuth } from '../../context/AuthContext';

const formatRole = (role: string) => role.replace(/^ROLE_/, '').replace(/_/g, ' ');
const formatCurrency = (amount: number) =>
  `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isCustomer = (role: string) => role.toUpperCase().includes('CUSTOMER');
const isRestaurantOwner = (role: string) => role.toUpperCase().includes('RESTAURANT');
const isAgent = (role: string) => role.toUpperCase().includes('AGENT');

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<OrderDTO[]>([]);
  const [agentOrders, setAgentOrders] = useState<OrderDTO[]>([]);
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.fullName, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, users]);

  const updateLocalUser = (updatedUser: UserDTO) => {
    setUsers((current) =>
      current.map((entry) => (entry.userId === updatedUser.userId ? updatedUser : entry)),
    );
    setSelectedUser((current) => (current?.userId === updatedUser.userId ? updatedUser : current));
  };

  const handleStatusChange = async (event: React.MouseEvent, user: UserDTO) => {
    event.stopPropagation();

    if (currentUser?.userId === user.userId) {
      setError('The signed-in admin account cannot suspend itself.');
      return;
    }

    setActionUserId(user.userId);
    setError(null);

    try {
      if (user.isActive) {
        await authService.suspendUser(user.userId);
        updateLocalUser({ ...user, isActive: false });
      } else {
        await authService.reactivateUser(user.userId);
        updateLocalUser({ ...user, isActive: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to update user status.');
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    if (currentUser?.userId === selectedUser.userId) {
      setError('The signed-in admin account cannot delete itself.');
      return;
    }

    setActionUserId(selectedUser.userId);
    setError(null);

    try {
      await authService.deleteUser(selectedUser.userId);
      setUsers((current) => current.filter((entry) => entry.userId !== selectedUser.userId));
      setSelectedUser(null);
    } catch (err: any) {
      setError(err?.message || 'Unable to delete user.');
    } finally {
      setActionUserId(null);
    }
  };

  const openUserDetails = async (user: UserDTO) => {
    setSelectedUser(user);
    setUserDetailsLoading(true);
    setUserOrders([]);
    setAgentOrders([]);
    setUserRestaurants([]);

    try {
      if (isCustomer(user.role)) {
        const orders = await orderService.getCustomerOrders(user.userId);
        setUserOrders(orders);
      } else if (isRestaurantOwner(user.role)) {
        const restaurants = await restaurantService.getRestaurantsByOwner(user.userId);
        setUserRestaurants(restaurants);
      } else if (isAgent(user.role)) {
        const orders = await orderService.getAgentOrders(user.userId);
        setAgentOrders(orders);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load user details.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="h-14 w-full max-w-md rounded-full bg-slate-200" />
        <div className="h-[600px] rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  const selectedAgentCompleted = agentOrders.filter((order) => order.status === 'DELIVERED').length;
  const selectedAgentLive = agentOrders.filter(
    (order) => !['DELIVERED', 'CANCELLED'].includes(order.status),
  ).length;

  return (
    <div className="relative max-w-[1600px] space-y-8 animate-fade-up">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">User Control Center</h1>
          <p className="font-medium text-slate-500">Moderate accounts and inspect live platform activity by role.</p>
        </div>
        <div className="group relative w-full max-w-md">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-full border border-slate-200 bg-white px-12 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </header>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <ShieldAlert size={18} /> {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50/50">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isSelf = currentUser?.userId === user.userId;

              return (
                <tr
                  key={user.userId}
                  onClick={() => void openUserDetails(user)}
                  className="group cursor-pointer transition-colors hover:bg-slate-50"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 font-display text-lg font-black text-indigo-600">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600">{user.fullName}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-block w-fit rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {formatRole(user.role)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                        <Calendar size={12} /> Joined {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        user.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      {user.isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={(event) => void handleStatusChange(event, user)}
                        disabled={actionUserId === user.userId || isSelf}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                          user.isActive
                            ? 'border border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {actionUserId === user.userId ? (
                          'Updating...'
                        ) : user.isActive ? (
                          <span className="flex items-center gap-2">
                            <UserX size={14} /> Suspend
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <UserCheck size={14} /> Reactivate
                          </span>
                        )}
                      </button>
                      <ChevronRight size={18} className="text-slate-400 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
              <Users size={32} className="opacity-50" />
            </div>
            <p className="font-display text-xl font-black text-slate-700">No users found</p>
            <p className="mt-1 text-sm font-medium">Try a different search or refresh the data.</p>
          </div>
        ) : null}
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 font-display text-2xl font-black text-white">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-3xl font-black text-slate-900">{selectedUser.fullName}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {formatRole(selectedUser.role)}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                      <Mail size={14} /> {selectedUser.email}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                <p className={`font-bold ${selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedUser.isActive ? 'Active Account' : 'Suspended'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</p>
                <p className="font-bold text-slate-700">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</p>
                <p className="font-mono font-bold text-slate-700">#{selectedUser.userId}</p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(event) => void handleStatusChange(event, selectedUser)}
                disabled={actionUserId === selectedUser.userId || currentUser?.userId === selectedUser.userId}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  selectedUser.isActive
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {selectedUser.isActive ? 'Suspend Account' : 'Reactivate Account'}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionUserId === selectedUser.userId || currentUser?.userId === selectedUser.userId}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} /> Delete User
              </button>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-black text-slate-900">
                {isCustomer(selectedUser.role) ? <ShoppingBag size={20} className="text-indigo-500" /> : null}
                {isRestaurantOwner(selectedUser.role) ? <Store size={20} className="text-amber-500" /> : null}
                {isAgent(selectedUser.role) ? <Truck size={20} className="text-emerald-500" /> : null}
                {isCustomer(selectedUser.role) && 'Customer Orders'}
                {isRestaurantOwner(selectedUser.role) && 'Managed Restaurants'}
                {isAgent(selectedUser.role) && 'Delivery Activity'}
              </h3>

              {userDetailsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
              ) : null}

              {!userDetailsLoading && isCustomer(selectedUser.role) ? (
                userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.orderNumber} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40">
                        <div>
                          <p className="font-bold text-slate-900">Order #{order.orderNumber}</p>
                          <p className="text-xs font-semibold text-slate-500">
                            Restaurant ID {order.restaurantId} | {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatCurrency(order.finalAmount || order.totalAmount)}</p>
                          <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-700">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                    No orders found for this customer.
                  </p>
                )
              ) : null}

              {!userDetailsLoading && isRestaurantOwner(selectedUser.role) ? (
                userRestaurants.length > 0 ? (
                  <div className="space-y-4">
                    {userRestaurants.map((restaurant) => (
                      <div key={restaurant.id} className="rounded-2xl border border-slate-100 p-5 transition hover:border-amber-100 hover:bg-amber-50/40">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-display text-lg font-black text-slate-900">{restaurant.name}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                              <MapPin size={12} /> {restaurant.address}, {restaurant.city}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                {restaurant.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">
                                {restaurant.isOpen ? 'Open' : 'Closed'}
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                            {restaurant.cuisineType || 'Various'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                    No restaurants are linked to this partner yet.
                  </p>
                )
              ) : null}

              {!userDetailsLoading && isAgent(selectedUser.role) ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70">Completed Deliveries</p>
                    <p className="mt-2 font-display text-3xl font-black text-emerald-900">{selectedAgentCompleted}</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-700/70">Active Assignments</p>
                    <p className="mt-2 font-display text-3xl font-black text-sky-900">{selectedAgentLive}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    {agentOrders.length > 0 ? (
                      agentOrders.slice(0, 5).map((order) => (
                        <div key={order.orderNumber} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:border-sky-100 hover:bg-sky-50/40">
                          <div>
                            <p className="font-bold text-slate-900">Order #{order.orderNumber}</p>
                            <p className="text-xs font-semibold text-slate-500">Restaurant ID {order.restaurantId}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                            {order.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                        No delivery orders found for this agent.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
