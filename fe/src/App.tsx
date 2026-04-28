import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import HowItWorksSection from './components/HowItWorksSection/HowItWorksSection';
import MatchesSection from './components/MatchesSection/MatchesSection';
import StepsSection from './components/StepsSection/StepsSection';
import Footer from './components/Footer/Footer';

function App() {
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
}

export default App;
