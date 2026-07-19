import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Navbar.css';
import AuthModal from '../AuthModal/AuthModal';
import Toast from '../Toast/Toast';
import type { ToastType } from '../Toast/Toast';

const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 60) {
          navRef.current.classList.add('scrolled');
        } else {
          navRef.current.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);

    gsap.fromTo(
      '.nav-item-anim',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
    );

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav
        ref={navRef}
        className="navbar navbar-expand-lg sportmatcher-nav fixed-top"
      >
        <div className="container">
          <a className="navbar-brand fw-bold nav-item-anim" href="#">
            <span className="brand-sport">Sport</span>
            <span className="brand-matcher">Mate</span>
          </a>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto gap-1">
              <li className="nav-item nav-item-anim">
                <a className="nav-link nav-link-custom active" href="#hero">Tìm trận đấu</a>
              </li>
              <li className="nav-item nav-item-anim">
                <a className="nav-link nav-link-custom" href="#how-it-works">Cách hoạt động</a>
              </li>
              <li className="nav-item nav-item-anim">
                <a className="nav-link nav-link-custom" href="#matches">Sự kiện</a>
              </li>
              <li className="nav-item nav-item-anim">
                <a className="nav-link nav-link-custom" href="#steps">Cộng đồng</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3 nav-item-anim">
              <a href="#" className="btn btn-nav-login" onClick={openLogin}>Đăng nhập</a>
              <a href="#" className="btn btn-nav-signup" onClick={openSignup}>Đăng ký</a>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onRegisterSuccess={(msg) => showToast(msg, 'success')}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Navbar;
