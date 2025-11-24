import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/DynamicNavbar';
import Footer from './components/Layout/Footer';
import FloatingButtons from './components/Layout/FloatingButtons';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import LoansPage from './pages/Loans/LoansPage';
import LoanDetail from './pages/Loans/LoanDetail';
import ApplyLoan from './pages/Application/ApplyLoan';
import EligibilityCheck from './pages/Application/EligibilityCheck';
import About from './pages/Info/About';
import HowItWorks from './pages/Info/HowItWorks';
import FAQ from './pages/Info/FAQ';
import Blog from './pages/Info/Blog';
import BlogPost from './pages/Info/BlogPost';
import PrivacyPolicy from './pages/Info/PrivacyPolicy';
import Terms from './pages/Info/Terms';
import Contact from './pages/Info/Contact';
import RepayLoan from './pages/Repay/RepayLoan';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Redirect Component
const AdminRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authenticated and is admin, go to dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If authenticated but not admin, go to user dashboard
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, redirect to login with return path
  return <Navigate to="/login" replace state={{ from: '/admin/dashboard', admin: true }} />;
};

// Layout Component to conditionally show Navbar/Footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Admin routes - no Navbar/Footer
    return <>{children}</>;
  }
  
  // Client routes - show Navbar/Footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/:slug" element={<LoanDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/repay" element={<RepayLoan />} />
            <Route path="/repay-loan" element={<RepayLoan />} />
            
            {/* Eligibility Check - Public */}
            <Route path="/eligibility" element={<EligibilityCheck />} />
            
            {/* Protected Routes */}
            <Route
              path="/apply"
              element={
                <ProtectedRoute>
                  <ApplyLoan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRedirect />
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
