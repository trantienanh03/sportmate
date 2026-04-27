import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

interface Slide {
  src: string;
  sport: string;
  tagline: string;
}

const slides: Slide[] = [
  { src: '/hero_basketball.png', sport: 'Basketball', tagline: 'Find Your Next Match.' },
  { src: '/hero_football.png', sport: 'Football', tagline: 'Play With Your Crew.' },
  { src: '/hero_badminton.png', sport: 'Badminton', tagline: 'Challenge Your Rivals.' },
  { src: '/hero_tennis.png', sport: 'Tennis', tagline: 'Elevate Your Game.' },
];

// transform presets
const kenBurns = [
  { from: 'scale(1.12) translate(-2%, -2%)', to: 'scale(1.0) translate(0%, 0%)' },
  { from: 'scale(1.0)  translate(2%, 1%)', to: 'scale(1.1) translate(-1%, -1%)' },
  { from: 'scale(1.08) translate(0%, 2%)', to: 'scale(1.0) translate(0%, -1%)' },
  { from: 'scale(1.05) translate(-1%, 0%)', to: 'scale(1.12) translate(1%, 1%)' },
];

const SLIDE_DURATION = 5;

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);

  const currentImgRef = useRef<HTMLDivElement>(null);
  const nextImgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const kbTimeline = useRef<gsap.core.Tween | null>(null);
  const slideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransiting = useRef(false);

  const startKenBurns = (el: HTMLDivElement, index: number) => {
    const kb = kenBurns[index % kenBurns.length];
    if (kbTimeline.current) kbTimeline.current.kill();
    gsap.set(el, { transform: kb.from });
    kbTimeline.current = gsap.to(el, {
      transform: kb.to,
      duration: SLIDE_DURATION + 1,
      ease: 'none',
    });
  };

  const animateText = () => {
    if (!textRef.current) return;
    const els = textRef.current.querySelectorAll('.hero-anim');
    gsap.fromTo(
      els,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );
  };

  const goToSlide = (nextIndex: number) => {
    if (isTransiting.current) return;
    isTransiting.current = true;
    setNext(nextIndex);
  };

  useEffect(() => {
    if (next === null) return;
    const currentEl = currentImgRef.current;
    const nextEl = nextImgRef.current;
    if (!currentEl || !nextEl) return;

    gsap.set(nextEl, { opacity: 0 });
    startKenBurns(nextEl, next);

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(next);
        setNext(null);
        isTransiting.current = false;
        animateText();
      },
    });

    tl.to(nextEl, { opacity: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
      .to(currentEl, { opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 0);
  }, [next]);

  useEffect(() => {
    if (slideTimeout.current) clearTimeout(slideTimeout.current);
    slideTimeout.current = setTimeout(() => {
      goToSlide((current + 1) % slides.length);
    }, SLIDE_DURATION * 1000);
    return () => {
      if (slideTimeout.current) clearTimeout(slideTimeout.current);
    };
  }, [current]);

  useEffect(() => {
    if (currentImgRef.current) {
      gsap.set(currentImgRef.current, { opacity: 1 });
      startKenBurns(currentImgRef.current, 0);
    }
    animateText();
  }, []);

  const handleDotClick = (idx: number) => {
    if (idx !== current && !isTransiting.current) goToSlide(idx);
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-slides">
        <div
          ref={currentImgRef}
          className="hero-slide-layer hero-slide-current"
          style={{ backgroundImage: `url(${slides[current].src})` }}
        />
        {next !== null && (
          <div
            ref={nextImgRef}
            className="hero-slide-layer hero-slide-next"
            style={{ backgroundImage: `url(${slides[next].src})` }}
          />
        )}
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content" ref={textRef}>
        <div className="hero-badge hero-anim">
          <span className="hero-badge-dot" />
          {slides[current].sport}
        </div>

        <h1 className="hero-title hero-anim">
          {slides[current].tagline}
          <br />
          <span className="hero-title-accent">Connect, Play, Compete.</span>
        </h1>

        <p className="hero-sub hero-anim">
          Join thousands of local players. Discover games, build teams, and elevate your game today.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3 hero-anim">
          <a href="#matches" className="btn btn-hero-primary">
            Join SportMate
          </a>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`hero-dot ${i === current ? 'hero-dot-active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
