import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import ExploreTours from './pages/ExploreTours';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PasswordReset from './components/auth/PasswordReset';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import BookingForm from './components/booking/BookingForm';
import BookingSuccess from './components/booking/BookingSuccess';
import StripeProvider from './components/payment/StripeProvider';
import CheckoutForm from './components/payment/CheckoutForm';
import AdminNav from './components/admin/AdminNav';
import AdminDashboard from './pages/admin/AdminDashboard';
import { PERMISSIONS } from './config/roles';

// Online images for authentication pages
const AUTH_IMAGES = {
  login: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?q=80&w=2073&auto=format&fit=crop",
  signup: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop",
  reset: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop"
};

// Admin route wrapper component
const AdminRoute = ({ children }) => {
  const { user, loading, hasPermission } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !hasPermission(PERMISSIONS.ACCESS_ADMIN)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
};

// Separate Routes component to access auth context
const AppRoutes = () => {
  const { user, loading, authInitialized } = useAuth();

  // Show loading spinner while auth is initializing
  if (!authInitialized || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Landing />
        </ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute>
          <ExploreTours />
        </ProtectedRoute>
      } />
      <Route path="/booking/:tourId" element={
        <ProtectedRoute>
          <StripeProvider>
            <BookingForm />
          </StripeProvider>
        </ProtectedRoute>
      } />
      <Route path="/booking/success" element={
        <ProtectedRoute>
          <BookingSuccess />
        </ProtectedRoute>
      } />
      <Route path="/payment/:bookingId" element={
        <ProtectedRoute>
          <StripeProvider>
            <CheckoutForm />
          </StripeProvider>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />

      {/* Public routes */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : (
          <AuthLayout imageSrc={AUTH_IMAGES.login}>
            <Login />
          </AuthLayout>
        )
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/" replace /> : (
          <AuthLayout imageSrc={AUTH_IMAGES.signup}>
            <SignUp />
          </AuthLayout>
        )
      } />
      <Route path="/reset-password" element={
        user ? <Navigate to="/" replace /> : (
          <AuthLayout imageSrc={AUTH_IMAGES.reset}>
            <PasswordReset />
          </AuthLayout>
        )
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
