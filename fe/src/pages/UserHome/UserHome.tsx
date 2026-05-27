import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { matchService } from '../../services/matchService';
import './UserHome.css';

const UserHome: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchService.getMatches();
        setMatches(data);
      } catch (err: any) {
        console.error("Lỗi khi tải danh sách trận đấu:", err);
        setError(err.message || "Không thể tải danh sách trận đấu");
      } finally {
        setIsMatchesLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getSportImage = (sport: string) => {
    if (!sport) return 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=500&auto=format&fit=crop&q=60';
    const s = sport.toLowerCase();
    if (s.includes('bóng đá') || s.includes('football') || s.includes('soccer')) {
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('cầu lông') || s.includes('badminton')) {
      return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('bóng rổ') || s.includes('basketball')) {
      return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('tennis') || s.includes('quần vợt')) {
      return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('pickleball')) {
      return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('bóng bàn') || s.includes('table tennis')) {
      return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500&auto=format&fit=crop&q=60';
    }
    if (s.includes('bóng chuyền') || s.includes('volleyball')) {
      return 'https://images.unsplash.com/photo-1592656094267-764a450f857e?w=500&auto=format&fit=crop&q=60';
    }
    return 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=500&auto=format&fit=crop&q=60';
  };

  const formatMatchTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${dayName}, ${day} tháng ${month} · ${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  const translateSkillLevel = (level: string) => {
    if (!level) return 'Mọi trình độ';
    switch (level.toLowerCase()) {
      case 'newbie': return 'Mới chơi';
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      case 'all': return 'Mọi trình độ';
      default: return level;
    }
  };
  return (
    <div className="user-home-page">
      <LoggedInNavbar />

      <main className="user-home-main py-5">
        <div className="container">
          <div className="row">

            <div className="col-xl-3 col-lg-4 col-md-5 mb-4">

              <div className="sidebar-card profile-card mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="profile-avatar me-3">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">{user?.fullName || 'User'}</h6>
                    <small className="text-muted">{user?.district || 'TP. Hồ Chí Minh'}</small>
                  </div>
                  <i className="fa-solid fa-chevron-right ms-auto text-muted"></i>
                </div>
              </div>

              <div className="sidebar-card mb-4 p-3">
                <div className="sidebar-card-header mb-3">
                  <h6 className="fw-bold mb-0">Lịch trình của bạn</h6>
                  <a href="#" className="text-primary text-decoration-none small fw-bold">Xem tất cả</a>
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <span className="fw-bold small" style={{ cursor: 'pointer', borderBottom: '2px solid #212529', paddingBottom: '4px' }}>Tham gia</span>
                  <span className="text-muted fw-medium small" style={{ cursor: 'pointer' }}>Đã lưu</span>
                </div>
                
                <div className="text-center py-3">
                  <h6 className="fw-bold mb-3">Lịch trình của bạn đang trống</h6>
                  <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold w-100">
                    Tìm sự kiện
                  </button>
                </div>
              </div>

              <div className="sidebar-card mb-4 p-3">
                <div className="sidebar-card-header mb-4">
                  <h6 className="fw-bold mb-0">Nhóm của bạn <span className="text-muted fw-normal ms-1">0</span></h6>
                  <a href="#" className="text-primary text-decoration-none small fw-bold">Xem tất cả</a>
                </div>
                <div className="text-center">
                  <h6 className="fw-bold mb-2">Tìm kiếm những người bạn mới?</h6>
                  <p className="text-muted small mb-3">Tham gia một nhóm có chung đam mê với bạn và bắt đầu kết nối ngay hôm nay.</p>
                  <button className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold w-100">
                    Khám phá nhóm
                  </button>
                </div>
              </div>

            </div>

            <div className="col-xl-9 col-lg-8 col-md-7 ps-lg-5">

              <div className="section-header d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">Gợi ý cho bạn</h4>
                <a href="#" className="text-primary text-decoration-none fw-bold">Xem tất cả</a>
              </div>

              {error && <div className="alert alert-danger mb-4">{error}</div>}

              <div className="row g-4">
                {isMatchesLoading ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải danh sách trận đấu...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <i className="fa-solid fa-calendar-minus text-muted fa-3x mb-3"></i>
                    <h5 className="fw-bold">Chưa có trận đấu nào</h5>
                    <p className="text-muted">Hãy tạo trận đấu đầu tiên để mọi người cùng tham gia!</p>
                    <Link to="/create-match" className="btn btn-dark rounded-pill px-4 py-2 fw-bold mt-2">
                      Tạo trận đấu ngay
                    </Link>
                  </div>
                ) : (
                  matches.map((match) => (
                    <div className="col-lg-4 col-sm-6" key={match.id}>
                      <Link to={`/matches/${match.id}`} className="text-decoration-none text-dark">
                        <div className="event-card">
                          <div className="event-img-wrapper">
                            <img src={getSportImage(match.sport)} alt={match.title} className="event-img" />
                            <button className="like-btn" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-heart"></i></button>
                          </div>
                          <div className="event-details mt-3">
                            <h5 className="event-title fw-bold" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem' }} title={match.title}>
                              {match.title}
                            </h5>
                            <p className="event-time text-muted small fw-medium mb-1">
                              {formatMatchTime(match.startTime)}
                            </p>
                            <p className="event-group text-muted small mb-1 text-truncate">
                              bởi {match.host?.fullName || 'Người dùng'} • <span className="badge bg-light text-dark border">{translateSkillLevel(match.skillLevel)}</span>
                            </p>
                            <p className="event-location text-muted small mb-2 text-truncate">
                              <i className="fa-solid fa-location-dot me-1"></i>
                              {match.venue?.name || match.locationText || 'Chưa có địa điểm'}
                            </p>
                            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                              <span className="small text-muted fw-semibold">
                                <i className="fa-solid fa-users me-1 text-primary"></i>
                                {match.currentPlayers || 1}/{match.maxPlayers} người
                              </span>
                              <span className="fw-bold text-dark small">
                                {match.feePerPerson === 0 ? 'Miễn phí' : `${match.feePerPerson.toLocaleString('vi-VN')}đ`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                )}
              </div>

              <div className="section-header d-flex justify-content-between align-items-center mt-5 mb-4">
                <h4 className="fw-bold m-0">Từ các nhóm của bạn</h4>
                <div className="dropdown">
                  <button className="btn filter-dropdown-btn dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Hôm nay
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    <li><a className="dropdown-item" href="#">Hôm nay</a></li>
                    <li><a className="dropdown-item" href="#">Ngày mai</a></li>
                    <li><a className="dropdown-item" href="#">Tuần này</a></li>
                    <li><a className="dropdown-item" href="#">Cuối tuần này</a></li>
                  </ul>
                </div>
              </div>

              <div className="empty-state text-center py-5 mb-5">
                <div className="empty-state-icon mb-3">
                  <i className="fa-solid fa-bed text-muted fa-3x"></i>
                  <div className="zzz text-primary fw-bold">Khò khò</div>
                </div>
                <h5 className="fw-bold mb-2">Các nhóm của bạn hiện đang im ắng</h5>
                <p className="text-muted mb-4">Hãy khám phá các hoạt động mới mẻ và giữ kết nối<br />với những gì đang diễn ra quanh bạn.</p>
                <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold">
                  Khám phá sự kiện
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserHome;
