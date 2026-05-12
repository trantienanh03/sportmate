import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';
import { authService } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
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
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const isLoginFormValid = email.trim() !== '' && password.trim() !== '';
  const isSignupFormValid = email.trim() !== '' && password.trim().length >= 10 && name.trim() !== '' && location.trim() !== '' && isAgeChecked;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginFormValid) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
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
          {mode === 'login' ? 'Log in' : (signupStep === 1 ? 'Sign up' : 'Finish signing up')}
        </h2>

        {mode === 'login' ? (
          <>
            <div className="auth-social-buttons">
              <button className="auth-social-btn">
                <i className="fab fa-google text-danger"></i>
                Log in with Google
              </button>
              <button className="auth-social-btn">
                <i className="fab fa-facebook text-primary"></i>
                Log in with Facebook
              </button>
            </div>

            <div className="auth-divider">or</div>

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
                <label className="auth-form-label">Password</label>
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
                <label htmlFor="keepLoggedIn">Keep me logged in</label>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isLoginFormValid && !isLoading ? 'active' : ''}`}
                disabled={!isLoginFormValid || isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>

              <div className="auth-footer-links">
                <p><a href="#forgot">Forgot password?</a></p>
                <p className="mt-3">
                  Don't have an account?{' '}
                  <a href="#signup" onClick={(e) => { e.preventDefault(); setMode('signup'); setSignupStep(1); }}>
                    Sign up
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
                  Continue with Google
                </button>
                <button className="auth-social-btn">
                  <i className="fab fa-facebook text-primary"></i>
                  Continue with Facebook
                </button>
              </div>

              <div className="auth-divider">or</div>

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
                    Sign up with email
                  </a>
                </div>

                <div className="auth-footer-links">
                  <p>
                    Already have an account?{' '}
                    <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                      Log in
                    </a>
                  </p>
                  <p className="auth-terms-text">
                    By signing up, you agree to <a href="#terms">Terms of Service</a>, <a href="#privacy">Privacy Policy</a>, and <a href="#cookie">Cookie Policy</a>.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              {error && <div className="alert alert-danger p-2 mb-3" style={{ fontSize: '14px' }}>{error}</div>}

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Your name</label>
                <input
                  type="text"
                  className="auth-form-input"
                  placeholder="Your full name here"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="auth-form-hint">Your name will be public on your Meetup profile</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Email address</label>
                <input
                  type="email"
                  className="auth-form-input"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="auth-form-hint">We'll use your email address to send you updates and to verify your account</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">
                  Password <i className="far fa-question-circle ms-1 text-muted"></i>
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
                <div className="auth-form-hint">At least 10 characters are required</div>
                <div className="auth-password-strength mt-2">
                  <div className={`strength-bar ${password.length > 0 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${password.length > 5 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${password.length >= 10 ? 'active' : ''}`}></div>
                  <div className={`strength-bar ${password.length > 12 ? 'active' : ''}`}></div>
                </div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">Location</label>
                <div className="auth-input-with-icon">
                  <i className="fas fa-map-marker-alt"></i>
                  <input
                    type="text"
                    className="auth-form-input"
                    placeholder="Ho Chi Minh City, VN"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="auth-form-hint">We'll use your location to show Meetup events near you.</div>
              </div>

              <div className="auth-form-group mb-4">
                <label className="auth-form-label">
                  Age <i className="far fa-question-circle ms-1 text-muted"></i>
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
                    I am 18 years of age or older.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className={`auth-submit-btn ${isSignupFormValid && !isLoading ? 'active' : ''}`}
                disabled={!isSignupFormValid || isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
              </button>

              <div className="auth-footer-links mt-4">
                <p>
                  Already have an account?{' '}
                  <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                    Log in
                  </a>
                </p>
                <p className="auth-terms-text">
                  By signing up, you agree to <a href="#terms">Terms of Service</a>, <a href="#privacy">Privacy Policy</a>, and <a href="#cookie">Cookie Policy</a>.
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
