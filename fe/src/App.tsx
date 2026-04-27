import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import HowItWorksSection from './components/HowItWorksSection/HowItWorksSection';

function App() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
    </>
  );
}

export default App;
