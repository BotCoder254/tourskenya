import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import ExploreTours from './pages/ExploreTours';
import Wishlist from './pages/Wishlist';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PasswordReset from './components/auth/PasswordReset';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTours from './pages/admin/ManageTours';
import ManageBookings from './pages/admin/ManageBookings';
import TourAvailability from './pages/admin/TourAvailability';
import AdminSettings from './pages/admin/AdminSettings';
import UserProfile from './pages/user/UserProfile';
import MyBookings from './pages/user/MyBookings';
import BookingHistory from './pages/user/BookingHistory';
import SearchResults from './pages/SearchResults';
import TourDetails from './pages/TourDetails';
import { PERMISSIONS } from './config/roles';

// Online images for authentication pages
const AUTH_IMAGES = {
  login: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?q=80&w=2073&auto=format&fit=crop",
  signup: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop",
  reset: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop"
};

// Protected route component that handles admin and user routes
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (requireAdmin && !hasPermission(PERMISSIONS.ACCESS_ADMIN)) {
    return <Navigate to="/tours" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Landing route that redirects authenticated users but preserves the landing page UI
const LandingRoute = () => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Landing isAuthenticated={!!user} userRole={user ? (hasPermission(PERMISSIONS.ACCESS_ADMIN) ? 'admin' : 'user') : 'guest'} />;
};

// Public route that handles authentication state
const PublicRoute = ({ children }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    if (hasPermission(PERMISSIONS.ACCESS_ADMIN)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/tours" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page - now handles authenticated users while preserving UI */}
          <Route path="/" element={<LandingRoute />} />

          {/* Auth routes - only accessible when not authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout imageSrc={AUTH_IMAGES.login}>
                <Login />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <AuthLayout imageSrc={AUTH_IMAGES.signup}>
                <SignUp />
              </AuthLayout>
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <AuthLayout imageSrc={AUTH_IMAGES.reset}>
                <PasswordReset />
              </AuthLayout>
            </PublicRoute>
          } />

          {/* User routes - require authentication */}
          <Route path="/tours" element={
            <ProtectedRoute>
              <ExploreTours />
            </ProtectedRoute>
          } />
          <Route path="/tours/:id" element={
            <ProtectedRoute>
              <TourDetails />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/booking-history" element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Admin routes - require admin role */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/tours" element={
            <ProtectedRoute requireAdmin={true}>
              <ManageTours />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute requireAdmin={true}>
              <ManageBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/availability" element={
            <ProtectedRoute requireAdmin={true}>
              <TourAvailability />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to appropriate page based on auth state */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;