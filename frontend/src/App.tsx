import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import PartnerLayout from './layouts/PartnerLayout';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';

// General Auth/Landing
import AuthLanding from './pages/AuthLanding';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoogleCallback from './pages/GoogleCallback';
import GitHubCallback from './pages/GitHubCallback';
import RequireAuth from './components/auth/RequireAuth';
import RequireRole from './components/auth/RequireRole';

// Customer Pages
import Landing from './pages/CinematicLandingWhite';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import Cart from './pages/customer/Cart';
import OrderTracking from './pages/customer/OrderTracking';
import NotificationCenter from './pages/customer/NotificationCenter';
import OrderSuccess from './pages/customer/OrderSuccess';
import Profile from './pages/customer/ModernProfile';
import Wallet from './pages/customer/Wallet';
import ItemDetails from './pages/customer/ItemDetails';
import SavedAddresses from './pages/customer/SavedAddresses';
import OrderHistory from './pages/customer/OrderHistory';

// Partner Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerOrders from './pages/partner/PartnerOrders';
import PartnerMenu from './pages/partner/PartnerMenu';
import PartnerAnalytics from './pages/partner/PartnerAnalytics';
import PartnerReviews from './pages/partner/PartnerReviews';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPayments from './pages/admin/AdminPayments';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentNavigation from './pages/agent/AgentNavigation';
import AgentEarnings from './pages/agent/AgentEarnings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
      <Routes>
        {/* Auth / Role Selection */}
        <Route path="/auth" element={<AuthLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />

        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/success" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
          <Route path="/tracking/:orderNumber" element={<RequireAuth><OrderTracking /></RequireAuth>} />
          <Route path="/tracking" element={<RequireAuth><OrderTracking /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationCenter /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
          <Route path="/customer/addresses" element={<RequireAuth><SavedAddresses /></RequireAuth>} />
          <Route path="/customer/history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
        </Route>

        {/* Partner Routes */}
        <Route path="/partner" element={<RequireRole allowedRoles={['PARTNER', 'ROLE_PARTNER', 'RESTAURANT_PARTNER', 'RESTAURANT_OWNER']}><PartnerLayout /></RequireRole>}>
          <Route index element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="orders" element={<PartnerOrders />} />
          <Route path="menu" element={<PartnerMenu />} />
          <Route path="analytics" element={<PartnerAnalytics />} />
          <Route path="reviews" element={<PartnerReviews />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireRole allowedRoles={['ADMIN', 'ROLE_ADMIN', 'APPLICATION_ADMIN', 'ROLE_APPLICATION_ADMIN']}><AdminLayout /></RequireRole>}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<RequireRole allowedRoles={['AGENT', 'ROLE_AGENT', 'DELIVERY_AGENT']}><AgentLayout /></RequireRole>}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="navigation" element={<AgentNavigation />} />
          <Route path="earnings" element={<AgentEarnings />} />
        </Route>

      </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
