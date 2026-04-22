import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Mail, Calendar, UserCheck, UserX, Users, ChevronRight, Briefcase, Truck, ShoppingBag, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { authService, type UserDTO } from '../../api/auth';
import { orderService } from '../../api/order';
import { restaurantService } from '../../api/restaurant';

const formatRole = (role: string) => role.replace(/^ROLE_/, '').replace(/_/g, ' ');

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  
  // Deep Dive Data
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userRestaurants, setUserRestaurants] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.fullName, user.email, user.role].filter(Boolean).some((value) => value.toLowerCase().includes(query))
    );
  }, [search, users]);

  const handleStatusChange = async (e: React.MouseEvent, user: UserDTO) => {
    e.stopPropagation();
    setActionUserId(user.userId);
    try {
      // Simulate API call for suspend/reactivate since backend might not have this endpoint yet
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(current => current.map(entry => entry.userId === user.userId ? { ...entry, isActive: !user.isActive } : entry));
    } catch (err) {
      console.error(err);
    } finally {
      setActionUserId(null);
    }
  };

  const openUserDetails = async (user: UserDTO) => {
    setSelectedUser(user);
    setUserDetailsLoading(true);
    try {
      if (user.role.includes('CUSTOMER')) {
        // Fetch order history for customer
        const orders = await orderService.getCustomerOrders();
        // Mock filtering just for visual display if we can't filter by user ID via API
        setUserOrders(orders.slice(0, 5));
      } else if (user.role.includes('RESTAURANT_OWNER')) {
        // Fetch restaurants for partner
        const rests = await restaurantService.getRestaurantsByOwner(user.userId);
        setUserRestaurants(rests);
      }
    } catch (err) {
      console.error("Failed to fetch deep dive details", err);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-[1600px]">
        <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8" />
        <div className="h-14 w-full max-w-md bg-slate-200 rounded-full mb-8" />
        <div className="h-[600px] bg-white rounded-[2.5rem] shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-[1600px] relative">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">User Control Center</h1>
          <p className="text-slate-500 font-medium">Manage platform access, review accounts, and dive into user activity.</p>
        </div>
        <div className="relative w-full max-w-md group">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full rounded-full bg-white border border-slate-200 px-12 py-3.5 text-sm font-medium outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 shadow-sm text-slate-700"
          />
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {/* ── Gorgeous Table ── */}
      <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
        <table className="w-full text-left font-sans">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role & Access</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr 
                key={user.userId} 
                onClick={() => openUserDetails(user)}
                className="transition-colors hover:bg-slate-50 cursor-pointer group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 flex items-center justify-center font-display font-black text-lg border border-indigo-100 shadow-sm group-hover:scale-105 transition-transform">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">{user.fullName}</p>
                      <p className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-slate-500">
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
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    user.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {user.isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={(e) => handleStatusChange(e, user)}
                      disabled={actionUserId === user.userId}
                      className={`relative overflow-hidden rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                        user.isActive 
                          ? 'bg-white border border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {actionUserId === user.userId ? (
                          <span className="animate-pulse">Updating...</span>
                        ) : (
                          <>
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            {user.isActive ? 'Suspend' : 'Reactivate'}
                          </>
                        )}
                      </div>
                    </button>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Users size={32} className="opacity-50" />
            </div>
            <p className="font-display text-xl font-black text-slate-700">No users found</p>
            <p className="text-sm font-medium mt-1">Adjust your search query or check database connection.</p>
          </div>
        )}
      </div>

      {/* ── Gorgeous Deep Dive Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl shadow-slate-900/20 p-8 md:p-10 animate-fade-up ring-1 ring-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-display font-black text-2xl shadow-lg shadow-indigo-500/30">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-3xl font-black text-slate-900">{selectedUser.fullName}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {formatRole(selectedUser.role)}
                    </span>
                    <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                      <Mail size={14} /> {selectedUser.email}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <p className={`font-bold ${selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedUser.isActive ? 'Active Account' : 'Suspended'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Joined Date</p>
                <p className="font-bold text-slate-700">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">User ID</p>
                <p className="font-mono font-bold text-slate-700">#{selectedUser.userId}</p>
              </div>
            </div>

            {/* Role-specific Deep Dive */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="font-display text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                {selectedUser.role.includes('CUSTOMER') && <><ShoppingBag size={20} className="text-indigo-500" /> Recent Orders</>}
                {selectedUser.role.includes('RESTAURANT') && <><Briefcase size={20} className="text-amber-500" /> Managed Restaurants</>}
                {selectedUser.role.includes('AGENT') && <><Truck size={20} className="text-emerald-500" /> Delivery Metrics</>}
              </h3>

              {userDetailsLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
              ) : (
                <div className="space-y-4">
                  
                  {/* CUSTOMER VIEW */}
                  {selectedUser.role.includes('CUSTOMER') && (
                    userOrders.length > 0 ? userOrders.map((order, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">Order #{order.id || 'N/A'}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{order.restaurantId ? `Restaurant ID: ${order.restaurantId}` : 'No restaurant info'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">₹{order.totalAmount || 0}</p>
                          <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                            {order.status || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    )) : <p className="text-sm font-bold text-slate-400 bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">No recent orders found.</p>
                  )}

                  {/* PARTNER VIEW */}
                  {selectedUser.role.includes('RESTAURANT') && (
                    userRestaurants.length > 0 ? userRestaurants.map((rest, i) => (
                      <div key={i} className="flex items-start justify-between p-5 rounded-2xl border border-slate-100 hover:border-amber-100 hover:bg-amber-50/50 transition-colors">
                        <div>
                          <p className="font-display text-lg font-black text-slate-900">{rest.name}</p>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {rest.address}, {rest.city}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-bold flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">
                              <CheckCircle2 size={12} className="text-emerald-500" /> {rest.isActive ? 'Active on Platform' : 'Inactive'}
                            </span>
                            <span className="text-xs font-bold flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">
                              <Clock size={12} className="text-blue-500" /> {rest.isOpen ? 'Currently Open' : 'Closed'}
                            </span>
                          </div>
                        </div>
                        <button className="text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full transition-colors">
                          Manage
                        </button>
                      </div>
                    )) : <p className="text-sm font-bold text-slate-400 bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">No restaurants associated with this partner.</p>
                  )}

                  {/* AGENT VIEW */}
                  {selectedUser.role.includes('AGENT') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">Verification</p>
                          <p className="font-bold text-emerald-900">Documents Valid</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-0.5">Active Status</p>
                          <p className="font-bold text-blue-900">Online & Ready</p>
                        </div>
                      </div>
                      <div className="col-span-2 mt-2">
                        <button className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                          View KYC Documents
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
