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
          {['Về chúng tôi', 'An toàn', 'Điều khoản dịch vụ', 'Chính sách bảo mật', 'Liên hệ'].map((link) => (
            <a key={link} href="#" className="footer-link">{link}</a>
          ))}
        </nav>

        <p className="footer-copy">©2026 SportMate. Cùng tham gia cuộc chơi.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
