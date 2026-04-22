import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const deliveryFee = items.length > 0 ? 49 : 0;
  const taxes = totalPrice * 0.05;
  const grandTotal = totalPrice + deliveryFee + taxes;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <header className="mb-6">
        <h1 className="mb-2 font-display text-4xl font-bold">Your Cart</h1>
        <p className="font-sans text-[var(--color-on-surface-variant)]">Review items before checkout.</p>
      </header>

      {items.length === 0 ? (
        <Card className="text-center">
          <h2 className="mb-2 font-serif text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-[var(--color-on-surface-variant)]">Add delicious dishes from nearby restaurants.</p>
          <Link to="/restaurants">
            <Button variant="primary">Browse Restaurants</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[var(--color-surface-container-highest)]">
                  <img
                    src={item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold">{item.name}</h3>
                  <p className="font-bold text-[var(--color-primary-container)]">Rs {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-[var(--color-surface-container-high)] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 rounded-full font-bold transition hover:bg-white"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 rounded-full font-bold transition hover:bg-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                >
                  Remove
                </button>
              </Card>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <Card className="sticky top-24">
              <h3 className="mb-6 font-serif text-2xl font-bold">Summary</h3>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                  <span>Subtotal</span>
                  <span>Rs {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                  <span>Delivery</span>
                  <span>Rs {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-on-surface-variant)]">
                  <span>Taxes</span>
                  <span>Rs {taxes.toFixed(2)}</span>
                </div>
              </div>
              <div className="mb-6 flex justify-between border-t border-[var(--color-surface-variant)] pt-4 text-xl font-bold">
                <span>Total</span>
                <span>Rs {grandTotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="block w-full">
                <Button variant="primary" fullWidth>
                  Proceed to Checkout
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}