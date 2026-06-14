import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import HowItWorksSection from '../../components/HowItWorksSection/HowItWorksSection';
import MatchesSection from '../../components/MatchesSection/MatchesSection';
import StepsSection from '../../components/StepsSection/StepsSection';
import Footer from '../../components/Footer/Footer';

const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

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
      <HeroSection />
      <HowItWorksSection />
      <MatchesSection />
      <StepsSection />
      <Footer />
    </>
  );
};

export default LandingPage;
