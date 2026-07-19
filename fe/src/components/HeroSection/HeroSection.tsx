import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

interface HeroSectionProps {
  onSignupClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSignupClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
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

        <div className="hero-left-images">
          <div className="hero-img-blob blob-1">
            <div className="img-wrapper blob-shape-1">
              <img src="/hero_basketball.png" alt="Basketball" />
            </div>
            <div className="hero-tag tag-near-you">GẦN BẠN</div>
          </div>
          <div className="hero-img-blob blob-2">
            <div className="img-wrapper blob-shape-2">
              <img src="/hero_football.png" alt="Football" />
            </div>
            <div className="hero-tag tag-dance">GIAO LƯU VUI</div>
          </div>
        </div>

        <div className="hero-center-content">
          <h1 className="hero-title">
            Nền tảng thể thao.<br />
            Nơi trận đấu kết nối<br />
            những tình bạn.
          </h1>
          <p className="hero-sub">
            Dù là bóng đá, bóng rổ, cầu lông hay tennis, luôn có hàng ngàn người chơi sẵn sàng chia sẻ đam mê trên SportMate. Tham gia chơi ngay!
          </p>
          <button className="btn btn-hero-primary" onClick={onSignupClick}>
            Tham gia SportMate
          </button>
        </div>

        <div className="hero-right-images">
          <div className="hero-img-blob blob-3">
            <div className="img-wrapper blob-shape-3">
              <img src="/hero_tennis.png" alt="Tennis" />
            </div>
            <div className="hero-tag tag-club">CHO NGƯỜI MỚI</div>
          </div>
          <div className="hero-img-blob blob-4">
            <div className="img-wrapper blob-shape-4">
              <img src="/hero_badminton.png" alt="Badminton" />
            </div>
            <div className="hero-tag tag-thursday">MỖI THỨ NĂM</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
