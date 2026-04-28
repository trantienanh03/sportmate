import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Basic entry animation
      gsap.from('.hero-center-content', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.blob-1, .blob-3', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      });

      gsap.from('.blob-2, .blob-4', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="hero-section" ref={containerRef}>
      <div className="container hero-container">

        {/* Left Images */}
        <div className="hero-left-images">
          <div className="hero-img-blob blob-1">
            <div className="img-wrapper blob-shape-1">
              <img src="/hero_basketball.png" alt="Basketball" />
            </div>
            <div className="hero-tag tag-near-you">NEAR YOU</div>
          </div>
          <div className="hero-img-blob blob-2">
            <div className="img-wrapper blob-shape-2">
              <img src="/hero_football.png" alt="Football" />
            </div>
            <div className="hero-tag tag-dance">FUN MATCHES</div>
          </div>
        </div>

        {/* Center Content */}
        <div className="hero-center-content">
          <h1 className="hero-title">
            The sports platform.<br />
            Where matches<br />
            become friendships.
          </h1>
          <p className="hero-sub">
            Whatever your sport, from football and basketball to badminton and tennis, there are thousands of players who share it on SportMate. Matches are happening every day—sign up to play.
          </p>
          <a href="#matches" className="btn btn-hero-primary">
            Join SportMate
          </a>
        </div>

        {/* Right Images */}
        <div className="hero-right-images">
          <div className="hero-img-blob blob-3">
            <div className="img-wrapper blob-shape-3">
              <img src="/hero_tennis.png" alt="Tennis" />
            </div>
            <div className="hero-tag tag-club">BEGINNER FRIENDLY</div>
          </div>
          <div className="hero-img-blob blob-4">
            <div className="img-wrapper blob-shape-4">
              <img src="/hero_badminton.png" alt="Badminton" />
            </div>
            <div className="hero-tag tag-thursday">EVERY THURSDAY</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
