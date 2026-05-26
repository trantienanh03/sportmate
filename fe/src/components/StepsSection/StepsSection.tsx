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
          <h2 className="display-5 fw-bold mb-3">Tình bạn bắt đầu từ SportMate</h2>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '700px' }}>
            Từ một trận giao lưu ngẫu nhiên đến một hội bạn thân thiết, kết nối qua thể thao chưa bao giờ dễ dàng đến thế.
          </p>
        </div>

        <div className="position-relative">
          <svg className="d-none d-lg-block position-absolute steps-line-vector" height="120" viewBox="0 0 1000 120" fill="none" preserveAspectRatio="none">
            <path d="M0 60C150 60 150 10 300 10C450 10 450 110 600 110C750 110 750 60 1000 60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 8" />
            <circle cx="300" cy="10" r="6" fill="#3B82F6" />
            <circle cx="600" cy="110" r="6" fill="#F59E0B" />
          </svg>

          <div className="row g-5">
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=400"
                title="Tôi tìm thấy người hướng dẫn của mình"
                description="Là người mới chơi bóng rổ, tôi muốn tìm một người hướng dẫn. Tôi đã gặp một cựu binh bóng rổ tại địa phương, người hiện đang làm huấn luyện viên cho nhóm chơi hàng tuần của chúng tôi."
              />
            </div>
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=400"
                title="Từ người quen xã giao thành bạn thân thiết"
                description="Đã có chứng minh rằng tình bạn thể thao cực kỳ bền chặt. Bắt đầu từ trận tennis thứ Ba hàng tuần giờ đã trở thành thói quen tụ tập cuối tuần của chúng tôi."
              />
            </div>
            <div className="col-lg-4">
              <StepCard 
                image="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400"
                title="Bạn đã có một biệt đội thực sự chưa?"
                description="Các nghiên cứu chỉ ra rằng người trưởng thành cần ít nhất 3 cấp độ tình bạn. SportMate giúp bạn lấp đầy các cấp độ đó thông qua những trận giao lưu cộng đồng."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
