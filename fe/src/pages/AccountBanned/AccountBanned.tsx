import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './AccountBanned.css';

const AccountBanned: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>(user?.email || '');
  const [title, setTitle] = useState<string>('Kháng cáo quyết định khóa tài khoản');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !title.trim() || !details.trim()) {
      setError('Vui lòng điền đầy đủ email, tiêu đề và nội dung trình bày kháng cáo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.submitAppeal({
        email: email.trim(),
        title: title.trim(),
        details: details.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi gửi đơn kháng cáo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="account-banned-page min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
      <div className="banned-card-wrapper shadow-lg rounded-4 overflow-hidden bg-white" style={{ maxWidth: '680px', width: '100%' }}>
        {/* Header Banner */}
        <div className="banned-card-header text-center text-white p-4 p-md-5">
          <div className="ban-icon-circle mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle">
            <i className="fa-solid fa-user-slash fa-2x"></i>
          </div>
          <h2 className="fw-bold mb-1">Tài Khoản Đã Bị Khóa</h2>
          <p className="mb-0 text-white-50 fs-6">
            Rất tiếc, tài khoản của bạn đã bị khóa bởi Ban Quản Trị do vi phạm quy định cộng đồng.
          </p>
        </div>

        <div className="p-4 p-md-5">
          {/* Status Info Box */}
          <div className="alert alert-danger border-0 shadow-sm rounded-3 p-3 mb-4">
            <div className="d-flex align-items-start">
              <i className="fa-solid fa-triangle-exclamation text-danger fa-lg me-3 mt-1"></i>
              <div>
                <h6 className="fw-bold mb-1 text-danger">Thông Tin Khóa Tài Khoản</h6>
                <p className="mb-1 small text-dark">
                  <strong>Tài khoản:</strong> {user?.email || email || 'Chưa xác định'}
                </p>
                <p className="mb-0 small text-dark">
                  <strong>Trạng thái:</strong>{' '}
                  <span className="badge bg-danger">
                    Bị khóa
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Appeal Form Section */}
          {!submitted ? (
            <div>
              <h5 className="fw-bold mb-2 text-dark">
                <i className="fa-solid fa-file-signature text-primary me-2"></i>
                Gửi Đơn Kháng Cáo (Gửi Yêu Cầu Mở Khóa)
              </h5>
              <p className="text-muted small mb-4">
                Nếu bạn cho rằng đây là quyết định nhầm lẫn hoặc đã khắc phục vi phạm, vui lòng gửi trình bày chi tiết bên dưới. Ban Quản Trị sẽ xem xét và phản hồi.
              </p>

              {error && (
                <div className="alert alert-warning py-2 mb-3 small d-flex align-items-center">
                  <i className="fa-solid fa-circle-exclamation me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email tài khoản:</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email tài khoản của bạn..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Tiêu đề kháng cáo:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Yêu cầu mở khóa tài khoản do nhầm lẫn..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Nội dung trình bày & Lý do kháng cáo:</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Mô tả chi tiết lý do bạn cho rằng tài khoản nên được mở khóa..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 fw-medium"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket me-2"></i>
                    Đăng Xuất
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane me-2"></i>
                        Gửi Đơn Kháng Cáo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="mb-3 text-success">
                <i className="fa-solid fa-circle-check fa-4x"></i>
              </div>
              <h4 className="fw-bold mb-2">Đã Gửi Đơn Kháng Cáo Thành Công!</h4>
              <p className="text-muted mb-4">
                Đơn kháng cáo của bạn đã được gửi trực tiếp tới bảng Quản Lý Báo Cáo của Admin. Ban Quản Trị sẽ xem xét và giải quyết trong thời gian sớm nhất.
              </p>
              <button
                className="btn btn-primary px-5 fw-bold"
                onClick={handleLogout}
              >
                Đồng Ý & Đăng Xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountBanned;
