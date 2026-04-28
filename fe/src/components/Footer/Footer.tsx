import './Footer.css';

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-sport">Sport</span>
          <span className="brand-matcher">Mate</span>
        </div>

        <nav className="footer-nav">
          {['About Us', 'Safety', 'Terms of Service', 'Privacy Policy', 'Contact'].map((link) => (
            <a key={link} href="#" className="footer-link">{link}</a>
          ))}
        </nav>

        <p className="footer-copy">©2026 SportMate. Join the game.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
