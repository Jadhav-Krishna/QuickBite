import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../api/order';
import { paymentService } from '../api/payment';
import { getCurrentUser, requireCurrentUserId } from '../utils/session';
import { getRazorpayKeyId, loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';

type CheckoutPaymentMethod = 'CASH_ON_DELIVERY' | 'WALLET' | 'UPI' | 'CREDIT_CARD';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = items.length > 0 ? 49 : 0;
  const discountAmount = 0;
  const finalAmount = totalPrice + deliveryFee - discountAmount;

  const restaurantId = useMemo(() => items[0]?.restaurantId, [items]);

  const buildPlaceOrderPayload = (customerId: number) => ({
    customerId,
    restaurantId,
    deliveryAddress: deliveryAddress.trim(),
    customerPhone: customerPhone.trim(),
    specialInstructions: specialInstructions.trim() || undefined,
    paymentMethod,
    items: items.map((item) => ({
      menuItemId: item.id,
      itemName: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: totalPrice,
    deliveryCharge: deliveryFee,
    discountAmount,
    finalAmount,
  });

  const handlePlaceOrder = async () => {
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!deliveryAddress.trim() || !customerPhone.trim()) {
      setError('Please provide delivery address and phone number.');
      return;
    }

    if (!restaurantId) {
      setError('Unable to identify restaurant for this order.');
      return;
    }

    setLoading(true);
    try {
      const customerId = requireCurrentUserId();
      const currentUser = getCurrentUser();

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        const order = await orderService.placeOrder(buildPlaceOrderPayload(customerId));
        clearCart();
        navigate('/success', {
          state: {
            orderNumber: order.orderNumber,
            amount: order.finalAmount,
          },
        });
        return;
      }

      if (paymentMethod === 'WALLET') {
        await paymentService.payAmountFromWallet(
          customerId,
          Number(finalAmount.toFixed(2)),
          'Checkout payment via wallet',
        );
        const order = await orderService.placeOrder(buildPlaceOrderPayload(customerId));
        clearCart();
        navigate('/success', {
          state: {
            orderNumber: order.orderNumber,
            amount: order.finalAmount,
          },
        });
        return;
      }

      const razorpayKey = getRazorpayKeyId();
      if (!razorpayKey) {
        throw new Error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in frontend environment.');
      }

      await loadRazorpayScript();

      // For non-COD flow, collect payment first and place order only after successful verification.
      const temporaryOrderRef = Date.now();
      const initiatedPayment = await paymentService.initiatePayment({
        orderId: temporaryOrderRef,
        customerId,
        amount: Number(finalAmount.toFixed(2)),
        currency: 'INR',
        paymentMethod,
        description: `QuickBite checkout payment`,
        customerEmail: currentUser?.email,
        customerPhone: customerPhone.trim(),
      });

      if (!initiatedPayment.razorpayOrderId) {
        throw new Error('Could not create Razorpay order. Please try again.');
      }
      const razorpayOrderId = initiatedPayment.razorpayOrderId;

      await new Promise<void>((resolve, reject) => {
        openRazorpayCheckout({
          key: razorpayKey,
          amount: Math.round(finalAmount * 100),
          currency: 'INR',
          name: 'QuickBite',
          description: 'Order payment',
          order_id: razorpayOrderId,
          prefill: {
            name: currentUser?.fullName,
            email: currentUser?.email,
            contact: customerPhone.trim(),
          },
          modal: {
            ondismiss: () => {
              void paymentService
                .markPaymentFailed(razorpayOrderId, 'Payment cancelled by user')
                .catch(() => undefined);
              reject(new Error('Payment was cancelled.'));
            },
          },
          handler: async (response) => {
            try {
              await paymentService.verifyPayment(
                response.razorpay_payment_id,
                response.razorpay_signature,
                response.razorpay_order_id,
              );

              const order = await orderService.placeOrder(buildPlaceOrderPayload(customerId));
              clearCart();
              navigate('/success', {
                state: {
                  orderNumber: order.orderNumber,
                  amount: order.finalAmount,
                },
              });
              resolve();
            } catch (verificationError) {
              const failureMessage = verificationError instanceof Error
                ? verificationError.message
                : 'Payment verification failed';
              try {
                await paymentService.markPaymentFailed(razorpayOrderId, failureMessage);
              } catch {
                // Ignore failure tracking errors so the original verification error surfaces.
              }
              reject(verificationError);
            }
          },
          theme: {
            color: '#f97316',
          },
        });
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-24">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[var(--color-surface)]/80 p-6 backdrop-blur-md">
        <Link to="/cart" className="flex items-center gap-2 font-medium text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary-container)]">
          <span>←</span> Back to Cart
        </Link>
        <span className="font-display text-xl font-bold">Checkout</span>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pt-8 md:flex-row md:px-8">
        <div className="flex-1 space-y-8">
          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <section>
            <h2 className="mb-4 font-serif text-2xl">Delivery Details</h2>
            <div className="space-y-4 rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-on-surface-variant)]">Address</label>
                <input
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="w-full rounded-2xl bg-[var(--color-surface-container-highest)] px-5 py-3 outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
                  placeholder="House no, street, city"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-on-surface-variant)]">Phone Number</label>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="w-full rounded-2xl bg-[var(--color-surface-container-highest)] px-5 py-3 outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
                  placeholder="+919999999999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-on-surface-variant)]">Delivery Instructions</label>
                <input
                  value={specialInstructions}
                  onChange={(event) => setSpecialInstructions(event.target.value)}
                  className="w-full rounded-2xl bg-[var(--color-surface-container-highest)] px-5 py-3 outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
                  placeholder="Ring bell once"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl">Payment Method</h2>
            <div className="space-y-3 rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('WALLET')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'WALLET' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                QuickBite Wallet
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'UPI' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${paymentMethod === 'CREDIT_CARD' ? 'border-[var(--color-primary-container)] bg-[var(--color-surface-container-low)]' : 'border-transparent bg-[var(--color-surface-container-highest)]'}`}
              >
                Card
              </button>
            </div>
          </section>
        </div>

        <div className="w-full md:w-96">
          <div className="sticky top-24 rounded-[2rem] bg-[var(--color-surface-container-lowest)] p-6 shadow-ambient">
            <h2 className="mb-6 font-serif text-2xl">Order Summary</h2>
            <div className="mb-6 space-y-4 border-b border-[var(--color-surface-variant)] pb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <span>₹ {(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                <span>Subtotal</span>
                <span>₹ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                <span>Delivery Fee</span>
                <span>₹ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-surface-variant)] pt-3 text-lg font-bold">
                <span>Total</span>
                <span>₹ {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className={`w-full rounded-[1.5rem] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] py-4 text-white transition ${loading ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.01]'}`}
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}