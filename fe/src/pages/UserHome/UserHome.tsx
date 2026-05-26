import React from 'react';
import { Link } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import './UserHome.css';

const UserHome: React.FC = () => {
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
                    <span>T</span>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">tienanhtran1003</h6>
                    <small className="text-muted">TP. Hồ Chí Minh</small>
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

              <div className="row g-4">
                <div className="col-lg-4 col-sm-6">
                  <Link to="/matches/1" className="text-decoration-none text-dark">
                    <div className="event-card">
                      <div className="event-img-wrapper">
                        <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                        <button className="like-btn" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-heart"></i></button>
                      </div>
                      <div className="event-details mt-3">
                        <h5 className="event-title fw-bold">Giao lưu Pickleball: Câu lạc bộ Quận 1 (Cho mọi trình độ)</h5>
                        <p className="event-time text-muted small fw-medium mb-1">Thứ 3, 12 tháng 5 · 19:00 (AEST)</p>
                        <p className="event-group text-muted small mb-1">bởi Hội Giao Lưu Thể Thao Sài Gòn • 4.7 <i className="fa-solid fa-star text-warning"></i></p>
                        <div className="d-flex align-items-center mt-2">
                          <div className="attendee-avatars">
                            <img src="https://i.pravatar.cc/150?img=11" alt="user" />
                            <img src="https://i.pravatar.cc/150?img=12" alt="user" />
                            <img src="https://i.pravatar.cc/150?img=13" alt="user" />
                          </div>
                          <span className="small text-muted ms-2 fw-medium">61 người tham gia</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-lg-4 col-sm-6">
                  <div className="event-card">
                    <div className="event-img-wrapper">
                      <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                      <button className="like-btn"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <div className="event-details mt-3">
                      <h5 className="event-title fw-bold">Giao lưu Bóng rổ ngoài trời (Công viên Tao Đàn)</h5>
                      <p className="event-time text-muted small fw-medium mb-1">Chủ Nhật, 17 tháng 5 · 12:00 (CST) · <i className="fa-solid fa-video ms-1"></i> Trực tuyến</p>
                      <p className="event-group text-muted small mb-1">bởi Cộng đồng Bóng rổ phong trào • 4.8 <i className="fa-solid fa-star text-warning"></i></p>
                      <div className="d-flex align-items-center mt-2">
                        <div className="attendee-avatars">
                          <img src="https://i.pravatar.cc/150?img=21" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=22" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=23" alt="user" />
                        </div>
                        <span className="small text-muted ms-2 fw-medium">18 người tham gia</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-sm-6">
                  <div className="event-card">
                    <div className="event-img-wrapper">
                      <img src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&auto=format&fit=crop&q=60" alt="Event" className="event-img" />
                      <button className="like-btn"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <div className="event-details mt-3">
                      <h5 className="event-title fw-bold">Hội thảo Lập trình viên ServiceNow TP. HCM Q2 2026</h5>
                      <p className="event-time text-muted small fw-medium mb-1">Thứ 7, 16 tháng 5 · 09:00 (ICT)</p>
                      <p className="event-group text-muted small mb-1">bởi Cộng đồng ServiceNow Việt Nam • 5.0 <i className="fa-solid fa-star text-warning"></i></p>
                      <div className="d-flex align-items-center mt-2">
                        <div className="attendee-avatars">
                          <img src="https://i.pravatar.cc/150?img=31" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=32" alt="user" />
                          <img src="https://i.pravatar.cc/150?img=33" alt="user" />
                        </div>
                        <span className="small text-muted ms-2 fw-medium">48 người tham gia</span>
                      </div>
                    </div>
                  </div>
                </div>
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
