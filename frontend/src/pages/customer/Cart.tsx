import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  const deliveryFee = items.length > 0 ? 49 : 0;
  const taxes = totalPrice * 0.05;
  const grandTotal = totalPrice + deliveryFee + taxes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pb-24">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Cart
            </h1>
          </div>
          <p className="text-gray-600 ml-16">Review your delicious selections</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="relative p-8 bg-white rounded-full shadow-2xl">
                <ShoppingBag className="w-24 h-24 text-gray-300" />
              </div>
            </div>
            <h2 className="mb-3 font-display text-3xl font-black text-gray-900">Your cart is empty</h2>
            <p className="mb-8 text-gray-600 text-center max-w-md">Discover amazing dishes from restaurants near you and start your culinary journey!</p>
            <Link to="/restaurants">
              <Button variant="primary" className="group">
                <span>Browse Restaurants</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    {/* Image */}
                    <div className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <img
                        src={item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-2xl font-black text-orange-600">₹{item.price.toFixed(0)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-full px-2 py-1.5 border border-orange-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center font-bold text-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-black text-gray-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center font-bold text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <span className="text-xs text-gray-500 font-semibold">Item Total</span>
                      <span className="text-xl font-black text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
                  <h3 className="font-display text-2xl font-black mb-1">Order Summary</h3>
                  <p className="text-orange-100 text-sm">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{totalPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-bold text-gray-900">₹{deliveryFee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Taxes & Fees</span>
                    <span className="font-bold text-gray-900">₹{taxes.toFixed(0)}</span>
                  </div>

                  {/* Promo Code */}
                  {/* <div className="pt-4 border-t border-gray-200">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600">Apply Promo Code</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div> */}

                  {/* Total */}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold text-gray-900">Grand Total</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹{grandTotal.toFixed(0)}
                      </span>
                    </div>

                    <Link to="/checkout" className="block w-full">
                      <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group">
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}