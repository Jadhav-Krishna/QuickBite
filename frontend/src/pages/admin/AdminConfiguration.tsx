import { useEffect, useState } from 'react';
import { Settings, Save, Database, Mail, CreditCard, Bell, Shield, Globe } from 'lucide-react';

interface ConfigSection {
  title: string;
  icon: any;
  color: string;
  settings: { key: string; value: string; description: string }[];
}

export default function AdminConfiguration() {
  const [configs, setConfigs] = useState<ConfigSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    
    const mockConfigs: ConfigSection[] = [
      {
        title: 'Database Configuration',
        icon: Database,
        color: 'blue',
        settings: [
          { key: 'DB_HOST', value: 'mysql', description: 'Database host address' },
          { key: 'DB_PORT', value: '3306', description: 'Database port number' },
          { key: 'REDIS_HOST', value: 'redis', description: 'Redis cache host' },
        ],
      },
      {
        title: 'Email Service',
        icon: Mail,
        color: 'purple',
        settings: [
          { key: 'MAIL_HOST', value: 'smtp.gmail.com', description: 'SMTP server host' },
          { key: 'MAIL_PORT', value: '587', description: 'SMTP server port' },
          { key: 'MAIL_FROM', value: 'noreply@quickbite.com', description: 'Default sender email' },
        ],
      },
      {
        title: 'Payment Gateway',
        icon: CreditCard,
        color: 'emerald',
        settings: [
          { key: 'RAZORPAY_KEY_ID', value: 'rzp_test_***', description: 'Razorpay API key' },
          { key: 'PAYMENT_TIMEOUT', value: '300', description: 'Payment timeout in seconds' },
        ],
      },
      {
        title: 'Notification Settings',
        icon: Bell,
        color: 'amber',
        settings: [
          { key: 'NOTIFICATION_ENABLED', value: 'true', description: 'Enable notifications' },
          { key: 'SMS_PROVIDER', value: 'Twilio', description: 'SMS service provider' },
        ],
      },
      {
        title: 'Security',
        icon: Shield,
        color: 'red',
        settings: [
          { key: 'JWT_EXPIRATION', value: '3600000', description: 'JWT token expiration (ms)' },
          { key: 'MAX_LOGIN_ATTEMPTS', value: '5', description: 'Maximum login attempts' },
        ],
      },
      {
        title: 'API Configuration',
        icon: Globe,
        color: 'cyan',
        settings: [
          { key: 'GATEWAY_PORT', value: '8000', description: 'API Gateway port' },
          { key: 'CORS_ORIGINS', value: 'http://localhost:5173', description: 'Allowed CORS origins' },
        ],
      },
    ];

    setConfigs(mockConfigs);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] space-y-8 animate-pulse">
        <div className="h-12 w-64 rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-3xl bg-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] space-y-8 animate-fade-up">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 font-display text-4xl font-black text-slate-900">System Configuration</h1>
          <p className="font-medium text-slate-500">Manage platform settings and environment variables</p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700">
          <Save size={16} /> Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((section) => {
          const Icon = section.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600 border-blue-200',
            purple: 'bg-purple-100 text-purple-600 border-purple-200',
            emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
            amber: 'bg-amber-100 text-amber-600 border-amber-200',
            red: 'bg-red-100 text-red-600 border-red-200',
            cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
          }[section.color];

          return (
            <div key={section.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses}`}>
                  <Icon size={24} />
                </div>
                <h2 className="font-display text-xl font-black text-slate-900">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{setting.key}</p>
                        <input
                          type="text"
                          defaultValue={setting.value}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-500/10"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{setting.description}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Settings size={20} className="text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 mb-1">Configuration Notice</p>
            <p className="text-sm text-amber-800">
              Changes to system configuration require service restart to take effect. Ensure you have proper backups before modifying critical settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
