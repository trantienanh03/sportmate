import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'));
const UserHome = lazy(() => import('./pages/UserHome/UserHome'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const MatchDetail = lazy(() => import('./pages/MatchDetail/MatchDetail'));
const CreateMatch = lazy(() => import('./pages/CreateMatch/CreateMatch'));
const MyRooms = lazy(() => import('./pages/MyRooms/MyRooms'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));

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
              <Route path="/" element={<LandingPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <UserHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches/:id"
                element={
                  <ProtectedRoute>
                    <MatchDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id?"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-match"
                element={
                  <ProtectedRoute>
                    <CreateMatch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rooms"
                element={
                  <ProtectedRoute>
                    <MyRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
