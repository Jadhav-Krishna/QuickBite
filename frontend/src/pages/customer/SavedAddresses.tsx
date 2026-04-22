import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MapPin, Plus, User, Clock } from 'lucide-react';

export default function SavedAddresses() {
  const addresses = [
    { id: 1, label: "Home", text: "456 Andheri West, Apt 4B", city: "Mumbai, MH 400053", isDefault: true },
    { id: 2, label: "Work", text: "Tech Park, Tower B, Floor 12", city: "Lower Parel, Mumbai, MH 400013", isDefault: false },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display font-bold text-4xl mb-2">My Addresses</h1>
          <p className="font-sans text-[var(--color-on-surface-variant)]">Manage your delivery locations.</p>
        </div>
        <Link to="/profile">
           <Button variant="outline" className="!py-2 !px-4 !text-sm">Back to Profile</Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]">
            <User size={18} /> Personal Info
          </Link>
          <Link to="/customer/addresses" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[var(--color-primary-container)] text-white shadow-ambient">
            <MapPin size={18} /> Addresses
          </Link>
          <Link to="/customer/history" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]">
            <Clock size={18} /> Order History
          </Link>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-serif text-xl font-bold">Saved Locations</h3>
             <Button variant="outline" className="flex items-center gap-2 !py-2 !px-4 !text-sm border-dashed"><Plus size={16} /> Add New</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <Card key={addr.id} className="relative border border-transparent hover:border-[var(--color-primary)] transition-colors">
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 bg-[var(--color-primary-container)]/10 text-[var(--color-primary-container)] text-xs font-bold px-2 py-1 rounded">Default</span>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[var(--color-surface-container-highest)] rounded-full text-[var(--color-on-surface-variant)]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{addr.label}</h4>
                    <p className="font-sans text-sm text-[var(--color-on-surface-variant)] mb-1">{addr.text}</p>
                    <p className="font-sans text-sm text-[var(--color-on-surface-variant)]">{addr.city}</p>
                    
                    <div className="flex gap-4 mt-6">
                      <button className="text-sm font-bold text-[var(--color-primary-container)]">Edit</button>
                      <button className="text-sm font-bold text-rose-500">Remove</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
