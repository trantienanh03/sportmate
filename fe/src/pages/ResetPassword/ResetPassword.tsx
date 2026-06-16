import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Criteria checks (matching the signup password policy)
  const isLengthValid = password.length >= 8;
  const isUppercaseValid = /[A-Z]/.test(password);
  const isSpecialCharValid = /[\W_]/.test(password);
  const isPasswordValid = isLengthValid && isUppercaseValid && isSpecialCharValid;
  const isMatching = password === confirmPassword && confirmPassword !== '';

  const isFormValid = isPasswordValid && isMatching;

  useEffect(() => {
    setError(null);
  }, [password, confirmPassword]);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate('/', { replace: true });
    }
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Liên kết khôi phục mật khẩu không hợp lệ.');
      return;
    }
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại liên kết khôi phục.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card error-card">
          <div className="reset-icon error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="reset-title">Yêu cầu không hợp lệ</h2>
          <p className="reset-description">
            Thiếu mã xác nhận đặt lại mật khẩu hoặc liên kết đã bị hỏng. Vui lòng yêu cầu một liên kết mới.
          </p>
          <Link to="/" className="reset-btn active text-center text-decoration-none d-inline-block pt-2">
            Quay lại Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-header">
          <Link to="/" className="reset-logo-link">
            <h1 className="reset-logo">SportMate</h1>
          </Link>
        </div>

        {!isSuccess ? (
          <>
            <h2 className="reset-title">Đặt lại mật khẩu</h2>
            <p className="reset-description">
              Tạo mật khẩu mới cho tài khoản của bạn. Vui lòng tạo mật khẩu đủ mạnh để giữ tài khoản an toàn.
            </p>

            {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="reset-form-group">
                <label className="reset-form-label">Mật khẩu mới</label>
                <div className="reset-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="reset-form-input"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="reset-form-group mb-4">
                <label className="reset-form-label">Xác nhận mật khẩu</label>
                <div className="reset-password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="reset-form-input"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`far ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Password Criteria Checklist */}
              <div className="reset-criteria-box mb-4">
                <ul className="reset-password-criteria">
                  <li className={password ? (isLengthValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isLengthValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Độ dài tối thiểu 8 ký tự
                  </li>
                  <li className={password ? (isUppercaseValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isUppercaseValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Chứa ít nhất 1 chữ cái viết hoa (A-Z)
                  </li>
                  <li className={password ? (isSpecialCharValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isSpecialCharValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Chứa ít nhất 1 ký tự đặc biệt (@, #, $, ...)
                  </li>
                  <li className={confirmPassword ? (isMatching ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${confirmPassword ? (isMatching ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Mật khẩu xác nhận trùng khớp
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className={`reset-btn ${isFormValid && !isLoading ? 'active' : ''}`}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Đang thực hiện đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="reset-icon success-icon mb-4">
              <i className="far fa-check-circle"></i>
            </div>
            <h2 className="reset-title mb-3">Đặt lại thành công!</h2>
            <p className="reset-description mb-4">
              Mật khẩu của bạn đã được cập nhật thành công. Hệ thống sẽ tự động chuyển hướng bạn quay lại trang chủ để đăng nhập trong <strong>{countdown} giây</strong>...
            </p>
            <Link to="/" className="reset-btn active text-center text-decoration-none d-inline-block pt-2">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
