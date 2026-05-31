import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import UserHome from './pages/UserHome/UserHome';
import ProfilePage from './pages/Profile/ProfilePage';
import MatchDetail from './pages/MatchDetail/MatchDetail';
import CreateMatch from './pages/CreateMatch/CreateMatch';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
          path="/profile" 
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
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
