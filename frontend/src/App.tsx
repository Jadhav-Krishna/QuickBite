import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import all pages and components from centralized routes
import {
  // Auth
  AuthLanding,
  ForgotPassword,
  Login,
  SignUp,
  GoogleCallback,
  GitHubCallback,
  RequireAuth,
  RequireRole,
  // Layouts
  CustomerLayout,
  PartnerLayout,
  AdminLayout,
  AgentLayout,
  // Customer Pages
  Landing,
  RestaurantsPage,
  SearchDishes,
  Menu,
  Checkout,
  Cart,
  OrderTracking,
  NotificationCenter,
  OrderSuccess,
  Profile,
  Wallet,
  ItemDetails,
  SavedAddresses,
  OrderHistory,
  MyReviews,
  // Partner Pages
  PartnerDashboard,
  PartnerOrders,
  PartnerMenu,
  PartnerAnalytics,
  PartnerReviewsPage,
  // Admin Pages
  AdminOverview,
  AdminUsers,
  AdminApprovals,
  AdminPayments,
  AdminReviewsPage,
  AdminSystemHealth,
  AdminConfiguration,
  AdminAgents,
  AdminOrderUtility,
  // Agent Pages
  AgentDashboard,
  AgentNavigation,
  AgentEarnings,
  AgentProfile,
  AgentReviews,
} from './routes';

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
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />

        {/* Customer Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<SearchDishes />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
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
          <Route path="/customer/reviews" element={<RequireAuth><MyReviews /></RequireAuth>} />
        </Route>

        {/* Partner Routes */}
        <Route path="/partner" element={<RequireRole allowedRoles={['PARTNER', 'ROLE_PARTNER', 'RESTAURANT_PARTNER', 'RESTAURANT_OWNER']}><PartnerLayout /></RequireRole>}>
          <Route index element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="orders" element={<PartnerOrders />} />
          <Route path="menu" element={<PartnerMenu />} />
          <Route path="analytics" element={<PartnerAnalytics />} />
          <Route path="reviews" element={<PartnerReviewsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireRole allowedRoles={['ADMIN', 'ROLE_ADMIN', 'APPLICATION_ADMIN', 'ROLE_APPLICATION_ADMIN']}><AdminLayout /></RequireRole>}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="system-health" element={<AdminSystemHealth />} />
          <Route path="configuration" element={<AdminConfiguration />} />
          <Route path="order-utility" element={<AdminOrderUtility />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<RequireRole allowedRoles={['AGENT', 'ROLE_AGENT', 'DELIVERY_AGENT']}><AgentLayout /></RequireRole>}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="navigation" element={<AgentNavigation />} />
          <Route path="earnings" element={<AgentEarnings />} />
          <Route path="reviews" element={<AgentReviews />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>

      </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
