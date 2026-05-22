import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalItems, 
    subtotal,
    discountAmount,
    totalPrice,
    promoCode,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    isLoading 
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplyingPromo(true);
    setPromoError('');

    try {
      await applyPromoCode(promoInput.trim().toUpperCase());
      setPromoInput('');
    } catch (error: any) {
      setPromoError(error.message || 'Invalid promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removePromoCode();
      setPromoInput('');
      setPromoError('');
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface)] px-5">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-surface-container)]">
            <ShoppingBag size={64} className="text-[var(--color-on-surface-variant)]" />
          </div>
          <h2 className="mb-3 font-display text-3xl font-bold">Your cart is empty</h2>
          <p className="mb-8 text-[var(--color-on-surface-variant)]">
            Add items from restaurants to get started
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3 font-bold text-white transition hover:opacity-90"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-surface-variant)]/60 bg-[var(--color-surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-xl font-bold">Your Cart</h1>
          <button
            onClick={clearCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">
                {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </h2>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card-hover flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card"
                >
                  {/* Item Image */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-display text-lg font-bold line-clamp-1">{item.name}</h3>
                    <p className="mb-2 font-display text-xl font-bold text-[var(--color-primary)]">
                      ₹{item.price.toFixed(0)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-primary)] hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-primary)] hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Promo Code Section */}
              <div className="rounded-2xl bg-white p-5 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Tag size={20} className="text-[var(--color-primary)]" />
                  <h3 className="font-display text-lg font-bold">Apply Promo Code</h3>
                </div>

                {promoCode ? (
                  <div className="rounded-xl bg-green-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-green-600" />
                        <span className="font-bold text-green-700">{promoCode}</span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 transition hover:bg-green-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {appliedPromoCode?.description && (
                      <p className="text-sm text-green-600">{appliedPromoCode.description}</p>
                    )}
                    <p className="mt-2 text-sm font-bold text-green-700">
                      You saved ₹{discountAmount.toFixed(2)}!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="Enter code"
                        className="flex-1 rounded-xl border border-[var(--color-outline-variant)] px-4 py-2 text-sm font-semibold uppercase outline-none focus:border-[var(--color-primary)]"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo}
                        className="rounded-xl bg-[var(--color-primary)] px-6 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-2 text-sm text-red-500">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="rounded-2xl bg-white p-5 shadow-card">
                <h3 className="mb-4 font-display text-lg font-bold">Bill Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-on-surface-variant)]">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="font-semibold text-green-600">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-[var(--color-outline-variant)] pt-3">
                    <div className="flex justify-between">
                      <span className="font-display text-lg font-bold">Total</span>
                      <span className="font-display text-lg font-bold text-[var(--color-primary)]">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="hero-button w-full rounded-2xl py-4 text-center font-bold text-white shadow-glow"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
