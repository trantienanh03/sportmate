import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowItWorksSection.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Discover Matches',
    desc: 'Browse hundreds of active games in your area across multiple sports and skill levels.',
  },
  {
    num: '02',
    title: 'Join or Create',
    desc: 'Sign up for an existing match or create your own and invite other players to join.',
  },
  {
    num: '03',
    title: 'Play & Connect',
    desc: 'Show up, compete, and build lasting connections with fellow athletes in your city.',
  },
];

const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hiw-title',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-title', start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.hiw-step',
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-step', start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.hiw-connector',
        { width: '0%' },
        {
          width: '68%', /* 100% - 16% - 16% = 68% */
          duration: 1.2, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.hiw-steps', start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="how-it-works-section py-5">
      <div className="container">
        <div className="text-center mb-5 hiw-title">
          <span className="section-chip">How it works</span>
          <h2 className="section-title mt-2">Three Simple Steps</h2>
          <p className="section-sub">Getting started is easy — no long sign-up forms or complicated setups.</p>
        </div>

        <div className="row g-4 justify-content-center position-relative hiw-steps">
          <div className="hiw-connector d-none d-md-block" />

          {steps.map((step) => (
            <div key={step.num} className="col-12 col-md-4 hiw-step">
              <div className="hiw-card">
                <div className="hiw-number">{step.num}</div>
                <h3 className="hiw-card-title">{step.title}</h3>
                <p className="hiw-card-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
