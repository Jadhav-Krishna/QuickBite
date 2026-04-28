import { useState } from 'react';
import { orderService } from '../../api/order';

export default function AdminOrderUtility() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const autoProgressOrder = async () => {
    if (!orderNumber.trim()) {
      setMessage('Please enter an order number');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Step 1: Confirm order
      await orderService.confirmOrder(orderNumber);
      setMessage('✓ Order confirmed');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Update to PREPARING
      await orderService.updateOrderStatus(orderNumber, 'PREPARING');
      setMessage('✓ Order confirmed → ✓ Preparing');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Update to READY
      await orderService.updateOrderStatus(orderNumber, 'READY');
      setMessage('✓ Order confirmed → ✓ Preparing → ✓ Ready for pickup!\n\nDelivery agents can now claim this order.');
      
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to progress order'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-xl border-2 border-indigo-200">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Auto-Progress Utility</h1>
        <p className="text-sm text-gray-600 mb-6">Development tool to quickly progress orders to READY status</p>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., ORD-1777325060747"
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        <button
          onClick={autoProgressOrder}
          disabled={loading || !orderNumber.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Auto-Progress to READY</span>
            </>
          )}
        </button>

        {message && (
          <div className={`mt-6 rounded-2xl p-4 ${message.includes('❌') ? 'bg-red-50 border-2 border-red-200' : 'bg-emerald-50 border-2 border-emerald-200'}`}>
            <p className={`text-sm font-bold whitespace-pre-line ${message.includes('❌') ? 'text-red-700' : 'text-emerald-700'}`}>
              {message}
            </p>
          </div>
        )}

        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
          <h3 className="text-sm font-black text-amber-900 mb-2">📝 How it works:</h3>
          <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
            <li>Confirms the order (PLACED → CONFIRMED)</li>
            <li>Starts preparation (CONFIRMED → PREPARING)</li>
            <li>Marks as ready (PREPARING → READY)</li>
            <li>Delivery agents can now see and claim the order</li>
          </ol>
        </div>

        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <h3 className="text-sm font-black text-blue-900 mb-2">💡 Next Steps:</h3>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Login as delivery agent (agent1@gmail.com)</li>
            <li>Go to Agent Dashboard</li>
            <li>Toggle "Online" status</li>
            <li>Click "Accept Next Order"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
