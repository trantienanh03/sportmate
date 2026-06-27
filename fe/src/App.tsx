import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'));
const UserHome = lazy(() => import('./pages/UserHome/UserHome'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const MatchDetail = lazy(() => import('./pages/MatchDetail/MatchDetail'));
const CreateMatch = lazy(() => import('./pages/CreateMatch/CreateMatch'));
const MyRooms = lazy(() => import('./pages/MyRooms/MyRooms'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/Users/AdminUsers'));
const AdminMatches = lazy(() => import('./pages/Admin/Matches/AdminMatches'));
const AdminReports = lazy(() => import('./pages/Admin/Reports/AdminReports'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories/AdminCategories'));
const AdminBills = lazy(() => import('./pages/Admin/Bills/AdminBills'));

function PageLoader() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ minHeight: '100vh', background: 'var(--bg-color, #f8f9fa)' }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Đang tải trang...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* User Routes */}
              <Route path="/home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
              <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
              <Route path="/profile/:id?" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/create-match" element={<ProtectedRoute><CreateMatch /></ProtectedRoute>} />
              <Route path="/my-rooms" element={<ProtectedRoute><MyRooms /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="matches" element={<AdminMatches />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="bills" element={<AdminBills />} />
              </Route>
            </Routes>
          </Suspense>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
