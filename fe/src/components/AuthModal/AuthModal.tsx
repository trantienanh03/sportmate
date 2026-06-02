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
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgeChecked, setIsAgeChecked] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailChecking, setIsEmailChecking] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setSignupStep(1);
    setEmail('');
    setPassword('');
    setName('');
    setLocation('');
    setIsAgeChecked(false);
    setKeepLoggedIn(false);
    setError(null);
    setEmailError(null);
    setIsEmailChecking(false);
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
      } finally {
        setIsEmailChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [email, mode]);

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
    location.trim() !== '' &&
    isAgeChecked;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginFormValid) return;

    setIsLoading(true);
    setError(null);
    try {
      const userData = await authService.login({ email, password });
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
      await authService.register({ fullName: name, email, password });
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
          {mode === 'login' ? 'Đăng nhập' : (signupStep === 1 ? 'Đăng ký' : 'Hoàn tất đăng ký')}
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
                <p><a href="#forgot">Quên mật khẩu?</a></p>
                <p className="mt-3">
                  Chưa có tài khoản?{' '}
                  <a href="#signup" onClick={(e) => { e.preventDefault(); setMode('signup'); setSignupStep(1); }}>
                    Đăng ký ngay
                  </a>
                </p>
              </div>
            </form>
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
                <label className="auth-form-label">Địa điểm</label>
                <div className="auth-input-with-icon">
                  <i className="fas fa-map-marker-alt"></i>
                  <input
                    type="text"
                    className="auth-form-input"
                    placeholder="TP. HCM, VN"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="auth-form-hint">Dùng để hiển thị các trận đấu gần bạn.</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">
                  Tuổi <i className="far fa-question-circle ms-1 text-muted"></i>
                </label>
                <div className="d-flex align-items-center mt-1">
                  <input
                    type="checkbox"
                    id="ageCheck"
                    checked={isAgeChecked}
                    onChange={(e) => setIsAgeChecked(e.target.checked)}
                    className="me-2"
                  />
                  <label htmlFor="ageCheck" className="fw-semibold" style={{ fontSize: '14px' }}>
                    Tôi từ 18 tuổi trở lên.
                  </label>
                </div>
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
