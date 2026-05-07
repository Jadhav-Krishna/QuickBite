import { useEffect, useState } from 'react';
import { Edit2, Plus, Power, Tag, Trash2, X } from 'lucide-react';
import { promoCodeService, PromoCode, CreatePromoCodeRequest } from '../../api/promoCode';

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<CreatePromoCodeRequest>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: undefined,
    usageLimit: undefined,
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const data = await promoCodeService.getAllPromoCodes();
      setPromoCodes(data);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await promoCodeService.updatePromoCode(editingPromo.id, formData);
      } else {
        await promoCodeService.createPromoCode(formData, 1);
      }
      await loadPromoCodes();
      handleCloseModal();
    } catch (error: any) {
      alert(error.message || 'Failed to save promo code');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await promoCodeService.deletePromoCode(id);
      await loadPromoCodes();
    } catch (error) {
      alert('Failed to delete promo code');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await promoCodeService.togglePromoCodeStatus(id);
      await loadPromoCodes();
    } catch (error) {
      alert('Failed to toggle promo code status');
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount,
      maxDiscountAmount: promo.maxDiscountAmount,
      usageLimit: promo.usageLimit,
      validFrom: new Date(promo.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(promo.validUntil).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      usageLimit: undefined,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Promo Codes</h1>
            <p className="text-[var(--color-on-surface-variant)]">Manage promotional offers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 font-bold text-white transition hover:opacity-90"
          >
            <Plus size={20} />
            Create Promo Code
          </button>
        </div>

        {/* Promo Codes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promoCodes.map((promo) => (
            <div
              key={promo.id}
              className="card-hover rounded-2xl bg-white p-5 shadow-card"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={20} className="text-[var(--color-primary)]" />
                  <span className="font-display text-xl font-bold">{promo.code}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(promo.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                      promo.isActive
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(promo)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-200"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="mb-3 text-sm text-[var(--color-on-surface-variant)]">
                {promo.description}
              </p>

              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-bold text-[var(--color-primary)]">
                  {promo.discountType === 'PERCENTAGE'
                    ? `${promo.discountValue}% OFF`
                    : `₹${promo.discountValue} OFF`}
                </span>
                {!promo.isActive && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                    Inactive
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-[var(--color-on-surface-variant)]">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <span className="font-semibold">₹{promo.minOrderAmount}</span>
                </div>
                {promo.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span>Max Discount:</span>
                    <span className="font-semibold">₹{promo.maxDiscountAmount}</span>
                  </div>
                )}
                {promo.usageLimit && (
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <span className="font-semibold">
                      {promo.usageCount}/{promo.usageLimit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-semibold">
                    {new Date(promo.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {promoCodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag size={64} className="mb-4 text-[var(--color-on-surface-variant)]" />
            <h3 className="mb-2 font-display text-xl font-bold">No promo codes yet</h3>
            <p className="text-[var(--color-on-surface-variant)]">
              Create your first promo code to get started
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 uppercase outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Min Order Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Max Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Valid From *</label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Valid Until *</label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-[var(--color-outline-variant)] py-3 font-bold transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 font-bold text-white transition hover:opacity-90"
                >
                  {editingPromo ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
