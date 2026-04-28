import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);

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

    // Animate nav items load
    gsap.fromTo(
      '.nav-item-anim',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
    );

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg sportmatcher-nav fixed-top"
    >
      <div className="container">
        <a className="navbar-brand fw-bold nav-item-anim" href="#">
          <span className="brand-sport">Sport</span>
          <span className="brand-matcher">Mate</span>
        </a>

        {/* Mobile toggler */}
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
              <a className="nav-link nav-link-custom active" href="#hero">Find Matches</a>
            </li>
            <li className="nav-item nav-item-anim">
              <a className="nav-link nav-link-custom" href="#how-it-works">How it Works</a>
            </li>
            <li className="nav-item nav-item-anim">
              <a className="nav-link nav-link-custom" href="#categories">Categories</a>
            </li>
            <li className="nav-item nav-item-anim">
              <a className="nav-link nav-link-custom" href="#matches">Teams</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 nav-item-anim">
            <a href="#" className="btn btn-nav-login">Log In</a>
            <a href="#" className="btn btn-nav-signup">Sign Up</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
