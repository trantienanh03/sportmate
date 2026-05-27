import React from 'react';
import './MatchesSection.css';

interface MatchCardProps {
  image: string;
  badge: string;
  title: string;
  date: string;
  location: string;
  organizer: string;
  category: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ image, badge, title, date, location, organizer, category }) => (
  <div className="match-card h-100">
    <div className="match-card-img-wrapper position-relative">
      <img src={image} alt={title} className="match-card-img" />
      <span className="match-card-badge">{badge}</span>
      <span className="match-card-category">{category}</span>
    </div>
    <div className="match-card-body d-flex flex-column mt-3">
      <h5 className="match-card-title fw-bold mb-2">{title}</h5>
      <p className="match-card-date mb-1 text-primary fw-semibold">{date}</p>
      <p className="match-card-info text-muted mb-1 small d-flex align-items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16"><path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" /><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
        {location}
      </p>
      <p className="match-card-info text-muted mb-0 small d-flex align-items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" /></svg>
        by {organizer}
      </p>
    </div>
  </div>
);

const MatchesSection: React.FC = () => {
  return (
    <section className="matches-section py-5 bg-light">
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h2 className="display-6 fw-bold mb-0 text-dark">Sự kiện gần</h2>
              <button className="btn btn-link text-primary fw-bold text-decoration-none p-0 fs-3 d-flex align-items-center">
                TP. Hồ Chí Minh, VN
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chevron-right ms-1" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
            <p className="text-muted fw-medium mb-0 mt-2">Tìm trận đấu yêu thích tiếp theo của bạn diễn ra trong tuần này.</p>
          </div>
          <button className="btn btn-link text-primary fw-bold text-decoration-none p-0">Xem tất cả sự kiện</button>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 mb-5">
          <div className="col">
            <MatchCard
              image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400"
              badge="Đã xác minh"
              title="Bóng đá giao lưu: Chào mừng mọi trình độ"
              date="Thứ 3, 12 tháng 5 · 16:00 (ICT)"
              location="Sân vận động Hoa Lư, Quận 1"
              organizer="CLB Bóng đá Sài Gòn"
              category="Bóng đá"
            />
          </div>
          <div className="col">
            <MatchCard
              image="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=400"
              badge="Miễn phí"
              title="Bóng rổ ngoài trời (Luyện tập 3x3)"
              date="Thứ 5, 14 tháng 5 · 17:30 (ICT)"
              location="Sân bóng rổ Công viên Tao Đàn"
              organizer="Hội bóng rổ Quận 1"
              category="Bóng rổ"
            />
          </div>
          <div className="col">
            <MatchCard
              image="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400"
              badge="Miễn phí"
              title="Cầu lông cho người mới bắt đầu (Hỗ trợ vợt)"
              date="Thứ 7, 16 tháng 5 · 09:00 (ICT)"
              location="Nhà thi đấu Phú Thọ"
              organizer="Hội cầu lông Sài Gòn"
              category="Cầu lông"
            />
          </div>
          <div className="col">
            <MatchCard
              image="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400"
              badge="Đã xác minh"
              title="Tennis đánh đôi: Nhóm trình độ trung bình"
              date="Chủ Nhật, 17 tháng 5 · 16:00 (ICT)"
              location="CLB Tennis Kỳ Hòa"
              organizer="Cộng đồng Tennis Quận 10"
              category="Tennis"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
