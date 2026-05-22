import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Server, Database, Zap, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../api/auth';

interface ServiceStatus {
  name: string;
  port: number;
  status: string;
}

interface HealthData {
  status: string;
  components?: any;
  timestamp: string;
}

export default function AdminSystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const [healthRes, configRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/health`).then(r => r.json()),
        fetch(`${API_BASE_URL}/admin/config`).then(r => r.json()),
      ]);
      setHealth(healthRes);
      setServices(configRes.services || []);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-200" />)}
        </div>
      </div>
    );
  }

  const isHealthy = health?.status === 'UP';

  return (
    <div className="max-w-[1600px] space-y-8 animate-fade-up">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">System Health</h1>
          <p className="font-medium text-slate-500">Monitor microservices and infrastructure status</p>
        </div>
        <button
          onClick={() => void fetchHealth()}
          className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-3xl border p-8 ${isHealthy ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isHealthy ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {isHealthy ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Overall Status</p>
              <p className={`font-display text-2xl font-black ${isHealthy ? 'text-emerald-900' : 'text-rose-900'}`}>
                {health?.status || 'UNKNOWN'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Server size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Services</p>
              <p className="font-display text-2xl font-black text-slate-900">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Uptime</p>
              <p className="font-display text-2xl font-black text-slate-900">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-black text-slate-900">
          <Activity size={24} className="text-red-600" /> Microservices Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:border-red-200 hover:bg-red-50/50 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200">
                    <Server size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-500">Port {service.port}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-700">
                  <CheckCircle2 size={12} /> {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {health?.components && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-black text-slate-900">
            <Database size={24} className="text-red-600" /> Infrastructure Components
          </h2>
          <div className="space-y-3">
            {Object.entries(health.components).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200">
                    <Database size={18} className="text-slate-600" />
                  </div>
                  <p className="font-bold text-slate-900 capitalize">{key}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                  value?.status === 'UP' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {value?.status || 'UNKNOWN'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
