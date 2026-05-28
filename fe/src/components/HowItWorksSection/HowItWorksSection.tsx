import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowItWorksSection.css';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Khám phá trận đấu',
    desc: 'Duyệt qua hàng trăm trận đấu đang hoạt động xung quanh bạn với nhiều môn thể thao và trình độ khác nhau.',
  },
  {
    num: '02',
    title: 'Tham gia hoặc Tạo mới',
    desc: 'Đăng ký tham gia một trận đấu có sẵn hoặc tự tạo trận đấu của riêng bạn để mời người khác chơi cùng.',
  },
  {
    num: '03',
    title: 'Chơi & Kết nối',
    desc: 'Ra sân, thi đấu hết mình và kết nối dài lâu với những người yêu thể thao trong thành phố của bạn.',
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
          <span className="section-chip">Cách hoạt động</span>
          <h2 className="section-title mt-2">Ba Bước Cực Kỳ Đơn Giản</h2>
          <p className="section-sub">Bắt đầu cực kỳ dễ dàng — không cần khai báo rườm rà hay thiết lập phức tạp.</p>
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
