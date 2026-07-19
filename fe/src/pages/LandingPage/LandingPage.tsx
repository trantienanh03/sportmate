import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import HowItWorksSection from '../../components/HowItWorksSection/HowItWorksSection';
import MatchesSection from '../../components/MatchesSection/MatchesSection';
import StepsSection from '../../components/StepsSection/StepsSection';
import Footer from '../../components/Footer/Footer';
import AuthModal from '../../components/AuthModal/AuthModal';
import Toast from '../../components/Toast/Toast';
import type { ToastType } from '../../components/Toast/Toast';

const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <Navbar />
      <HeroSection onSignupClick={openSignup} />
      <HowItWorksSection />
      <MatchesSection />
      <StepsSection />
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onRegisterSuccess={(msg) => setToast({ message: msg, type: 'success' })}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default LandingPage;

