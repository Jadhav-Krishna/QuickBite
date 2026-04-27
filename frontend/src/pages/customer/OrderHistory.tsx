import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat, MapPin, Phone, Receipt, Download, X, Star, MessageSquare } from 'lucide-react';
import { orderService, type OrderDTO } from '../../api/order';
import { restaurantService, type Restaurant } from '../../api/restaurant';
import { reviewService, type ReviewDTO } from '../../api/review';
import { requireCurrentUserId } from '../../utils/session';
import ReviewModal from '../../components/ReviewModal';

const formatOrderDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'PREPARING': return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'READY_FOR_PICKUP': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'OUT_FOR_DELIVERY': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-300';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getOrderSteps = (status: string) => {
  const allSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: Package },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
    { key: 'READY_FOR_PICKUP', label: 'Ready', icon: Clock },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  const statusUpper = status.toUpperCase();
  if (statusUpper === 'CANCELLED') {
    return [{ key: 'CANCELLED', label: 'Cancelled', icon: XCircle, active: true, completed: false }];
  }

  const currentIndex = allSteps.findIndex(s => s.key === statusUpper);
  return allSteps.map((step, idx) => ({
    ...step,
    active: idx === currentIndex,
    completed: idx < currentIndex,
  }));
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
  const [reviews, setReviews] = useState<Map<number, ReviewDTO>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<OrderDTO | null>(null);
  const customerId = requireCurrentUserId();

  useEffect(() => {
    loadOrders();
  }, []);

  // Auto-show review modal for newly delivered orders without reviews
  useEffect(() => {
    if (orders.length > 0 && reviews.size >= 0) {
      const deliveredWithoutReview = orders.find(
        order => order.status.toUpperCase() === 'DELIVERED' && !reviews.has(order.id)
      );
      
      if (deliveredWithoutReview && !showReviewModal) {
        // Show review modal after a short delay
        const timer = setTimeout(() => {
          handleOpenReviewModal(deliveredWithoutReview);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [orders, reviews]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const customerId = requireCurrentUserId();
      const data = await orderService.getCustomerOrders(customerId);
      setOrders(data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));

      // Load restaurant details
      const restaurantIds = [...new Set(data.map(o => o.restaurantId))];
      const restaurantPromises = restaurantIds.map(id => restaurantService.getRestaurantById(id));
      const restaurantData = await Promise.all(restaurantPromises);
      const restaurantMap = new Map(restaurantData.map(r => [r.id, r]));
      setRestaurants(restaurantMap);

      // Load reviews for all orders
      const reviewPromises = data.map(order => 
        reviewService.getReviewByOrder(order.id).catch(() => null)
      );
      const reviewData = await Promise.all(reviewPromises);
      const reviewMap = new Map(
        reviewData
          .filter((review): review is ReviewDTO => review !== null)
          .map(review => [review.orderId, review])
      );
      setReviews(reviewMap);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: OrderDTO) => {
    setSelectedOrder(order);
    setShowInvoice(false);
  };

  const handleViewInvoice = (order: OrderDTO) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleOpenReviewModal = (order: OrderDTO) => {
    setReviewingOrder(order);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    loadOrders(); // Reload to get the new review
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="skeleton h-12 w-64 rounded-2xl mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="mx-auto max-w-6xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-black text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600 mt-1">{orders.length} orders placed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Package size={48} className="text-gray-400" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-black text-gray-900">No orders yet</h3>
            <p className="text-sm text-gray-600">Start exploring restaurants and place your first order!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const restaurant = restaurants.get(order.restaurantId);
              const isDelivered = order.status.toUpperCase() === 'DELIVERED';
              const isCancelled = order.status.toUpperCase() === 'CANCELLED';
              const hasReview = reviews.has(order.id);
              const review = reviews.get(order.id);

              return (
                <div
                  key={order.id}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Restaurant Image */}
                          {restaurant?.imageUrl ? (
                            <img
                              src={restaurant.imageUrl}
                              alt={restaurant.name}
                              className="h-20 w-20 rounded-2xl object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                              <span className="text-3xl">🍽️</span>
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-display text-xl font-black text-gray-900">
                                  {restaurant?.name || 'Restaurant'}
                                </h3>
                                <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                              </div>
                              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatOrderDate(order.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package size={14} />
                                {order.items.length} items
                              </div>
                            </div>

                            {/* Items Preview */}
                            <div className="text-sm text-gray-700">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <span key={idx}>
                                  {item.quantity}x {item.itemName}
                                  {idx < Math.min(order.items.length, 2) - 1 && ', '}
                                </span>
                              ))}
                              {order.items.length > 2 && (
                                <span className="text-gray-500"> +{order.items.length - 2} more</span>
                              )}
                            </div>

                            {/* Review Display */}
                            {hasReview && review && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-bold text-gray-900">{review.restaurantRating}/5</span>
                                  </div>
                                  <span className="text-xs text-gray-500">Restaurant</span>
                                  {review.deliveryRating && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <div className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-bold text-gray-900">{review.deliveryRating}/5</span>
                                      </div>
                                      <span className="text-xs text-gray-500">Delivery</span>
                                    </>
                                  )}
                                </div>
                                {review.restaurantReview && (
                                  <p className="text-xs text-gray-600 line-clamp-2">{review.restaurantReview}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-display text-2xl font-black text-gray-900">₹{order.finalAmount.toFixed(2)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          {!isCancelled && !isDelivered && (
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                            >
                              Track Order
                            </button>
                          )}
                          <button
                            onClick={() => handleViewInvoice(order)}
                            className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-red-500 hover:bg-red-50 transition-colors"
                          >
                            View Invoice
                          </button>
                          {isDelivered && !hasReview && (
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 text-sm font-bold text-white hover:from-yellow-500 hover:to-orange-500 transition-colors flex items-center gap-2"
                            >
                              <Star size={16} />
                              Rate Order
                            </button>
                          )}
                          {isDelivered && hasReview && (
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              className="rounded-xl border-2 border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700 hover:bg-yellow-100 transition-colors flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              View Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-black text-gray-900">Order Tracking</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Info */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-4 border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Order Number</p>
                  <p className="font-display text-lg font-black text-gray-900">#{selectedOrder.orderNumber}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-600">Placed on</p>
                  <p className="text-sm font-bold text-gray-900">{formatOrderDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Tracking Steps */}
              <div className="mb-6">
                <h3 className="font-display text-lg font-black text-gray-900 mb-4">Order Status</h3>
                <div className="space-y-4">
                  {getOrderSteps(selectedOrder.status).map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="relative">
                          <div className={`rounded-full p-3 ${
                            step.completed ? 'bg-green-500' : step.active ? 'bg-red-500' : 'bg-gray-200'
                          }`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          {idx < getOrderSteps(selectedOrder.status).length - 1 && (
                            <div className={`absolute left-1/2 top-full h-8 w-0.5 -translate-x-1/2 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className={`font-bold ${
                            step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-6 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Delivery Address</p>
                    <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Contact Number</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          customerId={customerId}
          onClose={() => {
            setShowReviewModal(false);
            setReviewingOrder(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Invoice Modal */}
      {selectedOrder && showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-black text-gray-900">Invoice</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6" id="invoice-content">
              {/* Invoice Header */}
              <div className="mb-6 text-center">
                <h1 className="font-display text-4xl font-black text-red-600 mb-2">QuickBite</h1>
                <p className="text-sm text-gray-600">Food Delivery Service</p>
              </div>

              {/* Invoice Details */}
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Number</p>
                  <p className="font-bold text-gray-900">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
                  <p className="font-bold text-gray-900">{formatOrderDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</p>
                  <p className="font-bold text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="mb-6 rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Restaurant</p>
                <p className="font-display text-lg font-black text-gray-900">
                  {restaurants.get(selectedOrder.restaurantId)?.name || 'Restaurant'}
                </p>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="py-3 text-left text-xs font-bold uppercase text-gray-900">Item</th>
                      <th className="py-3 text-center text-xs font-bold uppercase text-gray-900">Qty</th>
                      <th className="py-3 text-right text-xs font-bold uppercase text-gray-900">Price</th>
                      <th className="py-3 text-right text-xs font-bold uppercase text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                        <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                        <td className="py-3 text-right text-sm text-gray-600">₹{item.price.toFixed(2)}</td>
                        <td className="py-3 text-right text-sm font-bold text-gray-900">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 rounded-2xl bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="font-bold text-gray-900">₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-bold text-green-600">-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-900 pt-2 flex justify-between">
                  <span className="font-display text-lg font-black text-gray-900">Total Amount</span>
                  <span className="font-display text-lg font-black text-red-600">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-6 rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery Address</p>
                <p className="text-sm text-gray-900">{selectedOrder.deliveryAddress}</p>
                <p className="text-sm text-gray-600 mt-1">Phone: {selectedOrder.customerPhone}</p>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Thank you for ordering with QuickBite!</p>
                <p className="mt-1">For support, contact us at support@quickbite.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
