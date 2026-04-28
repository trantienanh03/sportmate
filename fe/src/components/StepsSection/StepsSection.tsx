import React from 'react';
import './StepsSection.css';

interface StepCardProps {
  image: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ image, title, description }) => (
  <div className="step-card">
    <div className="step-card-img-wrapper">
      <img src={image} alt={title} className="step-card-img" />
    </div>
    <h3 className="step-card-title">{title}</h3>
    <p className="step-card-desc">{description}</p>
  </div>
);

const StepsSection: React.FC = () => {
  return (
    <section className="steps-section py-5">
      <div className="container position-relative z-1">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3">Friendships are made on SportMate</h2>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
            From a casual game to a core friend circle, connecting through sports has never been this easy.
          </p>
        </div>

        <div className="position-relative">
          {/* Connecting Line Vector (Visible on Desktop) */}
          <svg className="d-none d-lg-block position-absolute steps-line-vector" height="120" viewBox="0 0 1000 120" fill="none" preserveAspectRatio="none">
            <path d="M0 60C150 60 150 10 300 10C450 10 450 110 600 110C750 110 750 60 1000 60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
            <circle cx="300" cy="10" r="6" fill="#3B82F6" />
            <circle cx="600" cy="110" r="6" fill="#F59E0B" />
          </svg>

          <div className="row g-5">
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=400"
                title="I used SportMate to find a mentor"
                description="New to basketball, I wanted to find someone who could guide me. I found a local veteran player who now coaches our weekly group."
              />
            </div>
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=400"
                title="Casual connections to close friends"
                description="It's proven that sports friendships are harder to break. What started as a Tuesday tennis match is now a weekend tradition."
              />
            </div>
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400"
                title="Do you have the 'right' squad?"
                description="Studies show that adults need at least 3 tiers of friendships. SportMate helps you fill those tiers through community play."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
