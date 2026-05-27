import React from 'react';
import { useParams } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import './MatchDetail.css';

const MatchDetail: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>();

  const match = {
    title: 'Hội Giao Lưu Pickleball Quận 1',
    host: { name: 'Mai T.', avatar: 'https://i.pravatar.cc/150?img=5' },
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=1200&auto=format&fit=crop&q=80',
    date: 'Thứ Năm, 14 tháng 5',
    time: '20:00 đến 22:00 (ICT)',
    recurrence: 'Hàng tuần vào thứ Ba, thứ Năm',
    venue: 'Amber Pickleball Club',
    address: '326 Võ Văn Kiệt, Cầu Ông Lãnh · Quận 1, TP. Hồ Chí Minh',
    description: `Giao lưu Pickleball tại Amber Club 🎾\n\nChơi vui vẻ là chính, luôn chào đón người mới bắt đầu.\nĐến cùng chơi, đập vài đường bóng và trò chuyện vui vẻ, bạn có thể ở lại bao lâu tùy thích.\n\nChúng ta chơi, chúng ta hụt bóng, chúng ta cùng cười.\nMọi cấp độ đều có thể tham gia, chỉ cần xách vợt lên và đi 🙋‍♀️🙋‍♂️\n\nĐể đăng ký:\nSử dụng mã câu lạc bộ hoặc nhấn vào liên kết bên dưới để tham gia.\n\nHẹn gặp lại mọi người trên sân!`,
    attendees: [
      { id: 1, name: 'Mai T.', role: 'Người tổ chức', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: 2, name: 'John D.', role: 'Thành viên', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 3, name: 'Sarah W.', role: 'Thành viên', avatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 4, name: 'Mike R.', role: 'Thành viên', avatar: 'https://i.pravatar.cc/150?img=13' },
    ],
    price: '50.000 VND',
    spotsLeft: 19
  };

  return (
    <div className="match-detail-page bg-light min-vh-100">
      <LoggedInNavbar />

      <div className="bg-white pt-4 pb-4 border-bottom">
        <div className="container">
          <h1 className="fw-bolder mb-4 match-title">{match.title}</h1>
          <div className="d-flex align-items-center">
            <img
              src={match.host.avatar}
              alt="host"
              className="rounded-circle me-3 border"
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            />
            <div>
              <p className="mb-0 text-muted small fw-medium">Tổ chức bởi</p>
              <h6 className="fw-bold mb-0">{match.host.name}</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row position-relative">

          <div className="col-lg-8 pe-lg-5 mb-5">
            <img
              src={match.image}
              alt={match.title}
              className="w-100 rounded-4 mb-5 object-fit-cover shadow-sm"
              style={{ height: '400px' }}
            />

            <h4 className="fw-bold mb-3">Chi tiết</h4>
            <div className="mb-5 text-break match-description">
              {match.description}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 d-flex align-items-center">
                Người tham gia
                <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill ms-2 fs-6">
                  {match.attendees.length}
                </span>
              </h4>
              <a href="#" className="text-primary fw-medium text-decoration-none">Xem tất cả</a>
            </div>

            <div className="d-flex flex-wrap gap-4 mb-5 p-4 bg-white rounded-4 shadow-sm">
              {match.attendees.map(a => (
                <div key={a.id} className="text-center attendee-item">
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="rounded-circle mb-2 border"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                  />
                  <p className="fw-bold mb-0 small text-truncate" style={{ maxWidth: '80px' }}>{a.name}</p>
                  <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>{a.role}</p>
                </div>
              ))}
            </div>

            <h4 className="fw-bold mb-3">Thảo luận</h4>
            <div className="card border-0 bg-white shadow-sm rounded-4 p-4 mb-5">
              <div className="d-flex align-items-start mb-3">
                <img src="https://i.pravatar.cc/150?img=8" className="rounded-circle me-3 mt-1" style={{ width: '40px', height: '40px' }} alt="User" />
                <div className="flex-grow-1">
                  <textarea className="form-control bg-light border-0 rounded-3" rows={2} placeholder="Thêm bình luận..."></textarea>
                  <div className="text-end mt-2">
                    <button className="btn btn-secondary fw-bold px-4 rounded-pill" disabled>Đăng</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
              <div className="card-body p-4">
                <div className="d-flex mb-4">
                  <div className="me-3 mt-1">
                    <i className="fa-regular fa-clock fs-4 text-muted"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{match.date}</h6>
                    <p className="text-muted small mb-0">{match.time}</p>
                    <p className="text-muted small mt-1 mb-0 d-flex align-items-center">
                      <i className="fa-solid fa-rotate-right me-1"></i> {match.recurrence}
                    </p>
                  </div>
                </div>

                <div className="d-flex mb-2">
                  <div className="me-3 mt-1">
                    <i className="fa-solid fa-location-dot fs-4 text-muted"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{match.venue}</h6>
                    <p className="text-muted small mb-1">{match.address}</p>
                    <a href="#" className="text-primary small text-decoration-none fw-medium d-flex align-items-center">
                      Cách tìm vị trí <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '10px' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div style={{ height: '90px' }}></div>

      <div className="fixed-bottom bg-white border-top py-3 sticky-bottom-bar shadow-lg" style={{ zIndex: 1000 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-none d-sm-block">
              <p className="text-muted fw-bold mb-0" style={{ fontSize: '13px' }}>{match.date}</p>
              <h5 className="fw-bolder mb-0 text-truncate" style={{ maxWidth: '300px' }}>{match.title}</h5>
            </div>

            <div className="d-flex align-items-center ms-auto">
              <div className="text-end me-3 d-none d-md-block">
                <span className="fw-bold fs-6 me-3">{match.price}</span>
                <span className="badge bg-warning bg-opacity-25 text-dark border border-warning rounded-pill px-3 py-2 fw-bold">
                  Còn {match.spotsLeft} chỗ trống
                </span>
              </div>

              <button className="btn btn-light rounded-circle me-2 action-icon-btn">
                <i className="fa-regular fa-heart"></i>
              </button>
              <button className="btn btn-light rounded-circle me-3 action-icon-btn d-none d-sm-inline-block">
                <i className="fa-solid fa-arrow-up-from-bracket"></i>
              </button>

              <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm">
                Tham gia
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default MatchDetail;
