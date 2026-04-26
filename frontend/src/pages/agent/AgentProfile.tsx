import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bike, Shield, Save, ArrowLeft, LogOut } from 'lucide-react';
import { deliveryService, type DeliveryAgentDTO } from '../../api/delivery';
import { useAuth } from '../../context/AuthContext';

export default function AgentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<DeliveryAgentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    vehicleType: 'BIKE',
    vehicleNumber: '',
    licenseNumber: '',
    aadharNumber: '',
  });

  useEffect(() => {
    void loadProfile();
  }, [user?.userId]);

  const loadProfile = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      const resolved = await deliveryService.resolveAgentForUser(user.userId);
      setAgent(resolved.agent);
      setFormData({
        fullName: resolved.agent.fullName || '',
        phone: resolved.agent.phone || '',
        email: resolved.agent.email || '',
        vehicleType: resolved.agent.vehicleType || 'BIKE',
        vehicleNumber: resolved.agent.vehicleNumber || '',
        licenseNumber: resolved.agent.licenseNumber || '',
        aadharNumber: resolved.agent.aadharNumber || '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await deliveryService.updateProfile(agent.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadProfile();
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 pb-10 animate-fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">Update your information</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <User size={16} />
            </div>
            <h2 className="font-display text-base font-bold text-slate-900">Personal Info</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                pattern="[6-9][0-9]{9}"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bike size={16} />
            </div>
            <h2 className="font-display text-base font-bold text-slate-900">Vehicle Info</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition"
                required
              >
                <option value="BIKE">Bike</option>
                <option value="SCOOTER">Scooter</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="CAR">Car</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Vehicle Number
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                placeholder="MH12AB1234"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                License Number
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                placeholder="MH1234567890123"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition uppercase"
                required
              />
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Shield size={16} />
            </div>
            <h2 className="font-display text-base font-bold text-slate-900">Security</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Aadhar Number
              </label>
              <input
                type="text"
                value={formData.aadharNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setFormData({ ...formData, aadharNumber: value });
                }}
                placeholder="1234 5678 9012"
                maxLength={12}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition"
              />
              <p className="mt-1.5 text-[10px] text-slate-500">
                Required for verification
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {agent && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {agent.isVerified ? 'Verified' : 'Pending'}
                </p>
              </div>
              <div className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                agent.isVerified 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {agent.isVerified ? 'Verified' : 'Pending'}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Save size={18} /> Save Profile
            </>
          )}
        </button>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-200 bg-white py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:scale-[1.02] active:scale-95"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </form>
    </div>
  );
}
