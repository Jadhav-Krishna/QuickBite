import { useEffect, useState } from 'react';
import { Bike, Search, Shield, CheckCircle2, XCircle, Phone, Mail, CreditCard } from 'lucide-react';
import { deliveryService, type DeliveryAgentDTO } from '../../api/delivery';

export default function AdminAgents() {
  const [agents, setAgents] = useState<DeliveryAgentDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgentDTO | null>(null);

  useEffect(() => {
    void fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getAllAgents();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const query = search.toLowerCase();
    return (
      agent.fullName.toLowerCase().includes(query) ||
      agent.email.toLowerCase().includes(query) ||
      agent.phone.includes(query) ||
      agent.vehicleNumber.toLowerCase().includes(query)
    );
  });

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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">Delivery Agents</h1>
          <p className="font-medium text-slate-500">Manage and verify delivery agent accounts</p>
        </div>
      </header>

      <div className="relative group">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or vehicle number..."
          className="w-full rounded-full border border-slate-200 bg-white px-12 py-3.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-red-300 focus:ring-4 focus:ring-red-500/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 font-display text-xl font-black text-white">
                  {agent.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{agent.fullName}</p>
                  <p className="text-xs text-slate-500">{agent.vehicleType}</p>
                </div>
              </div>
              {agent.isVerified ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
              ) : (
                <XCircle size={20} className="text-amber-500" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700 truncate">{agent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bike size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">{agent.vehicleNumber}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Deliveries</p>
                <p className="font-bold text-slate-900">{agent.totalDeliveries || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rating</p>
                <p className="font-bold text-slate-900">⭐ {(agent.averageRating || 0).toFixed(1)}</p>
              </div>
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                  agent.isOnline 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {agent.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
            <Bike size={32} className="opacity-50" />
          </div>
          <p className="font-display text-xl font-black text-slate-700">No agents found</p>
          <p className="mt-1 text-sm font-medium">Try adjusting your search query</p>
        </div>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAgent(null)} />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 font-display text-2xl font-black text-white">
                  {selectedAgent.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-3xl font-black text-slate-900">{selectedAgent.fullName}</h2>
                  <p className="text-sm text-slate-500 mt-1">Agent ID: #{selectedAgent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {selectedAgent.isVerified ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <XCircle size={20} className="text-amber-500" />
                  )}
                  <span className="font-bold text-slate-900">
                    {selectedAgent.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Availability</p>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                  selectedAgent.isOnline 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedAgent.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Phone size={18} className="text-red-600" /> Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Phone</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAgent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Email</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAgent.email}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Bike size={18} className="text-red-600" /> Vehicle Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Type</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAgent.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Number</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAgent.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">License</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAgent.licenseNumber}</span>
                  </div>
                </div>
              </div>

              {selectedAgent.aadharNumber && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-amber-600" /> Security Information
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-700">Aadhar Number</span>
                    <span className="text-sm font-bold text-amber-900">
                      {selectedAgent.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-red-600" /> Performance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Deliveries</p>
                    <p className="font-display text-2xl font-black text-slate-900">{selectedAgent.totalDeliveries || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Average Rating</p>
                    <p className="font-display text-2xl font-black text-slate-900">⭐ {(selectedAgent.averageRating || 0).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
