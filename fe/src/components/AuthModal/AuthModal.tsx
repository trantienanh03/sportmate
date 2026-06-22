import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onRegisterSuccess?: (message: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onRegisterSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailChecking, setIsEmailChecking] = useState(false);

  // Trạng thái quên mật khẩu
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setSignupStep(1);
    setEmail('');
    setPassword('');
    setName('');
    setDistrict('');
    setKeepLoggedIn(false);
    setError(null);
    setEmailError(null);
    setIsEmailChecking(false);
    setForgotEmail('');
    setIsForgotSuccess(false);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (mode !== 'signup' || !email) {
      setEmailError(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email không đúng định dạng");
      return;
    }

    setEmailError(null);
    setIsEmailChecking(true);

    const timer = setTimeout(async () => {
      try {
        const exists = await authService.checkEmailExists(email);
        if (exists) {
          setEmailError("Email này đã được đăng ký!");
        } else {
          setEmailError(null);
        }
      } catch (err) {
        console.error("Lỗi check email:", err);
        setEmailError("Không thể kết nối máy chủ để kiểm tra email");
      } finally {
        setIsEmailChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [email, mode]);

  useEffect(() => {
    setError(null);
  }, [email, password, name, district, forgotEmail]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isForgotFormValid = forgotEmail.trim() !== '' && emailRegex.test(forgotEmail);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isForgotFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(forgotEmail);
      setIsForgotSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gửi yêu cầu khôi phục thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLoginFormValid = email.trim() !== '' && password.trim() !== '';

  const isPasswordLengthValid = password.length >= 8;
  const isPasswordUppercaseValid = /[A-Z]/.test(password);
  const isPasswordSpecialCharValid = /[\W_]/.test(password);
  const isPasswordValid = isPasswordLengthValid && isPasswordUppercaseValid && isPasswordSpecialCharValid;

  const isSignupFormValid =
    email.trim() !== '' &&
    emailError === null &&
    !isEmailChecking &&
    isPasswordValid &&
    name.trim() !== '' &&
    district.trim() !== '';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      const userData = await authService.login({ email, password, keepLoggedIn });
      login(userData);
      onClose();
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignupFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      await authService.register({ fullName: name, email, password, district });
      onClose();
      setMode('login');
      setSignupStep(1);
      onRegisterSuccess?.('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal-content">
        {(mode === 'signup' && signupStep === 2) ? (
          <button className="auth-modal-back" onClick={() => setSignupStep(1)}>
            <i className="fas fa-arrow-left"></i>
          </button>
        ) : null}

        <button className="auth-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <h2 className="auth-modal-title">
          {mode === 'login' ? 'Đăng nhập' : (mode === 'forgot' ? 'Quên mật khẩu' : (signupStep === 1 ? 'Đăng ký' : 'Hoàn tất đăng ký'))}
        </h2>

        {mode === 'login' ? (
          <>
            <div className="auth-social-buttons">
              <button className="auth-social-btn">
                <i className="fab fa-google text-danger"></i>
                Đăng nhập bằng Google
              </button>
              <button className="auth-social-btn">
                <i className="fab fa-facebook text-primary"></i>
                Đăng nhập bằng Facebook
              </button>
            </div>

            <div className="auth-divider">hoặc</div>

            {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="auth-form-group">
                <label className="auth-form-label">Email</label>
                <input
                  type="email"
                  className="auth-form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">Mật khẩu</label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                />
                <label htmlFor="keepLoggedIn">Duy trì đăng nhập</label>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isLoginFormValid && !isLoading ? 'active' : ''}`}
                disabled={!isLoginFormValid || isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="auth-footer-links">
                <p>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setMode('forgot'); }}>
                    Quên mật khẩu?
                  </a>
                </p>
                <p className="mt-3">
                  Chưa có tài khoản?{' '}
                  <a href="#signup" onClick={(e) => { e.preventDefault(); setMode('signup'); setSignupStep(1); }}>
                    Đăng ký ngay
                  </a>
                </p>
              </div>
            </form>
          </>
        ) : mode === 'forgot' ? (
          <>
            {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>{error}</div>}
            
            {!isForgotSuccess ? (
              <form onSubmit={handleForgotSubmit}>
                <p className="text-muted text-center mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu mới.
                </p>
                <div className="auth-form-group mb-4">
                  <label className="auth-form-label">Email của bạn</label>
                  <input
                    type="email"
                    className="auth-form-input"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={`auth-submit-btn ${isForgotFormValid && !isLoading ? 'active' : ''}`}
                  disabled={!isForgotFormValid || isLoading}
                >
                  {isLoading ? 'Đang gửi yêu cầu...' : 'Gửi liên kết đặt lại'}
                </button>

                <div className="auth-footer-links mt-4">
                  <p>
                    <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                      Quay lại Đăng nhập
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-3">
                <div className="text-success mb-3" style={{ fontSize: '48px' }}>
                  <i className="far fa-check-circle"></i>
                </div>
                <h4 className="fw-bold mb-3">Yêu cầu đã được gửi!</h4>
                <p className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  Một email khôi phục mật khẩu đã được gửi đến địa chỉ <strong>{forgotEmail}</strong>. 
                  Vui lòng kiểm tra hộp thư đến (và hộp thư rác/spam nếu không tìm thấy) để tiếp tục.
                </p>
                <button
                  type="button"
                  className="auth-submit-btn active"
                  onClick={() => {
                    setMode('login');
                    setIsForgotSuccess(false);
                    setForgotEmail('');
                  }}
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            )}
          </>
        ) : (
          signupStep === 1 ? (
            <>
              <div className="auth-social-buttons">
                <button className="auth-social-btn">
                  <i className="fab fa-google text-danger"></i>
                  Tiếp tục với Google
                </button>
                <button className="auth-social-btn">
                  <i className="fab fa-facebook text-primary"></i>
                  Tiếp tục với Facebook
                </button>
              </div>

              <div className="auth-divider">hoặc</div>

              <div>
                <div className="text-center mt-4 mb-4">
                  <a
                    href="#email-signup"
                    className="fw-bold"
                    style={{ color: '#212529', textDecoration: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSignupStep(2);
                    }}
                  >
                    Đăng ký bằng email
                  </a>
                </div>

                <div className="auth-footer-links">
                  <p>
                    Đã có tài khoản?{' '}
                    <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                      Đăng nhập
                    </a>
                  </p>
                  <p className="auth-terms-text">
                    Bằng việc đăng ký, bạn đồng ý với <a href="#terms">Điều khoản dịch vụ</a>, <a href="#privacy">Chính sách bảo mật</a>, và <a href="#cookie">Chính sách Cookie</a>.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>{error}</div>}

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Tên của bạn</label>
                <input
                  type="text"
                  className="auth-form-input"
                  placeholder="Nhập họ và tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="auth-form-hint">Họ tên sẽ hiển thị công khai trên hồ sơ</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Địa chỉ Email</label>
                <input
                  type="email"
                  className={`auth-form-input ${emailError ? 'is-invalid' : ''}`}
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <div className="text-danger mt-1" style={{ fontSize: '13px' }}>{emailError}</div>}
                {isEmailChecking && <div className="text-muted mt-1" style={{ fontSize: '13px' }}><i className="fas fa-spinner fa-spin me-1"></i>Đang kiểm tra email...</div>}
                {!emailError && !isEmailChecking && email.trim() !== '' && <div className="text-success mt-1" style={{ fontSize: '13px' }}>Email khả dụng</div>}
                <div className="auth-form-hint">Dùng để nhận thông báo và xác minh tài khoản</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">
                  Mật khẩu <i className="far fa-question-circle ms-1 text-muted"></i>
                </label>
                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div className="auth-form-hint">Mật khẩu tối thiểu 8 ký tự, chứa chữ hoa và ký tự đặc biệt</div>
                <div className="auth-password-strength mt-2">
                  <div className={`strength-bar ${password.length > 0 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${password.length >= 4 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${password.length >= 8 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${isPasswordValid ? 'active' : ''}`}></div>
                </div>
                <ul className="auth-password-criteria">
                  <li className={password ? (isPasswordLengthValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isPasswordLengthValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Độ dài tối thiểu 8 ký tự
                  </li>
                  <li className={password ? (isPasswordUppercaseValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isPasswordUppercaseValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Chứa ít nhất 1 chữ cái viết hoa (A-Z)
                  </li>
                  <li className={password ? (isPasswordSpecialCharValid ? 'valid' : 'invalid') : ''}>
                    <i className={`fas ${password ? (isPasswordSpecialCharValid ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle'}`}></i>
                    Chứa ít nhất 1 ký tự đặc biệt (ví dụ: @, #, $, ...)
                  </li>
                </ul>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Quận/Huyện</label>
                <div className="auth-input-with-icon">
                  <i className="fas fa-map-marker-alt"></i>
                  <select
                    className="auth-form-input"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    <option value="Quận 1">Quận 1</option>
                    <option value="Quận 3">Quận 3</option>
                    <option value="Quận 4">Quận 4</option>
                    <option value="Quận 5">Quận 5</option>
                    <option value="Quận 6">Quận 6</option>
                    <option value="Quận 7">Quận 7</option>
                    <option value="Quận 8">Quận 8</option>
                    <option value="Quận 10">Quận 10</option>
                    <option value="Quận 11">Quận 11</option>
                    <option value="Quận 12">Quận 12</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Bình Tân">Bình Tân</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                    <option value="Phú Nhuận">Phú Nhuận</option>
                    <option value="Tân Bình">Tân Bình</option>
                    <option value="Tân Phú">Tân Phú</option>
                    <option value="Bình Chánh">Bình Chánh</option>
                    <option value="Cần Giờ">Cần Giờ</option>
                    <option value="Củ Chi">Củ Chi</option>
                    <option value="Hóc Môn">Hóc Môn</option>
                    <option value="Nhà Bè">Nhà Bè</option>
                    <option value="TP. Thủ Đức">TP. Thủ Đức</option>
                  </select>
                </div>
                <div className="auth-form-hint">Dùng để hiển thị các trận đấu gần bạn.</div>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isSignupFormValid && !isLoading ? 'active' : ''}`}
                disabled={!isSignupFormValid || isLoading}
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>

              <div className="auth-footer-links mt-4">
                <p>
                  Đã có tài khoản?{' '}
                  <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                    Đăng nhập
                  </a>
                </p>
                <p className="auth-terms-text">
                  Bằng việc đăng ký, bạn đồng ý với <a href="#terms">Điều khoản dịch vụ</a>, <a href="#privacy">Chính sách bảo mật</a>, và <a href="#cookie">Chính sách Cookie</a>.
                </p>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};

export default AuthModal;
