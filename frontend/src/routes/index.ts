// General Auth/Landing
export { default as AuthLanding } from '../pages/AuthLanding';
export { default as ForgotPassword } from '../pages/ForgotPassword';
export { default as Login } from '../pages/Login';
export { default as SignUp } from '../pages/SignUp';
export { default as GoogleCallback } from '../pages/OAuthCallback';
export { default as GitHubCallback } from '../pages/GitHubCallback';

// Customer Pages
export { default as Landing } from '../pages/CinematicLandingWhite';
export { default as Restaurants } from '../pages/Restaurants';
export { default as RestaurantsPage } from '../pages/customer/RestaurantsPage';
export { default as SearchDishes } from '../pages/customer/SearchDishes';
export { default as Menu } from '../pages/Menu';
export { default as Checkout } from '../pages/Checkout';
export { default as Cart } from '../pages/customer/Cart';
export { default as OrderTracking } from '../pages/customer/OrderTracking';
export { default as NotificationCenter } from '../pages/customer/NotificationCenter';
export { default as OrderSuccess } from '../pages/customer/OrderSuccess';
export { default as Profile } from '../pages/customer/ModernProfile';
export { default as Wallet } from '../pages/customer/Wallet';
export { default as ItemDetails } from '../pages/customer/ItemDetails';
export { default as SavedAddresses } from '../pages/customer/SavedAddresses';
export { default as OrderHistory } from '../pages/customer/OrderHistory';
export { default as MyReviews } from '../pages/customer/MyReviews';

// Partner Pages
export { default as PartnerDashboard } from '../pages/partner/PartnerDashboard';
export { default as PartnerOrders } from '../pages/partner/PartnerOrders';
export { default as PartnerMenu } from '../pages/partner/PartnerMenu';
export { default as PartnerAnalytics } from '../pages/partner/PartnerAnalytics';
export { default as PartnerReviews } from '../pages/partner/PartnerReviews';
export { default as PartnerReviewsPage } from '../pages/partner/PartnerReviewsPage';

// Admin Pages
export { default as AdminOverview } from '../pages/admin/AdminOverview';
export { default as AdminUsers } from '../pages/admin/AdminUsers';
export { default as AdminApprovals } from '../pages/admin/AdminApprovals';
export { default as AdminPayments } from '../pages/admin/AdminPayments';
export { default as AdminReviews } from '../pages/admin/AdminReviews';
export { default as AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
export { default as AdminSystemHealth } from '../pages/admin/AdminSystemHealth';
export { default as AdminConfiguration } from '../pages/admin/AdminConfiguration';
export { default as AdminAgents } from '../pages/admin/AdminAgents';
export { default as AdminOrderUtility } from '../pages/admin/AdminOrderUtility';

// Agent Pages
export { default as AgentDashboard } from '../pages/agent/AgentDashboard';
export { default as AgentNavigation } from '../pages/agent/AgentNavigation';
export { default as AgentEarnings } from '../pages/agent/AgentEarnings';
export { default as AgentProfile } from '../pages/agent/AgentProfile';
export { default as AgentReviews } from '../pages/agent/AgentReviews';

// Layouts
export { default as CustomerLayout } from '../layouts/CustomerLayout';
export { default as PartnerLayout } from '../layouts/PartnerLayout';
export { default as AdminLayout } from '../layouts/AdminLayout';
export { default as AgentLayout } from '../layouts/AgentLayout';

// Auth Components
export { default as RequireAuth } from '../components/auth/RequireAuth';
export { default as RequireRole } from '../components/auth/RequireRole';
