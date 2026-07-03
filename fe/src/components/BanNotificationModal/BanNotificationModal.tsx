import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BanNotificationModal.css';

interface BanNotificationModalProps {
  isOpen: boolean;
  message?: string;
  onClose?: () => void;
}

const BanNotificationModal: React.FC<BanNotificationModalProps> = ({ isOpen, message, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleGoToAppeal = () => {
    if (onClose) onClose();
    navigate('/account-banned');
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className="modal-backdrop fade show ban-backdrop" style={{ zIndex: 9998 }}></div>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 9999 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-danger text-white border-bottom-0 py-3">
              <div className="d-flex align-items-center">
                <i className="fa-solid fa-triangle-exclamation fa-lg me-2"></i>
                <h5 className="modal-title fw-bold mb-0">THÔNG BÁO KHÓA TÀI KHOẢN</h5>
              </div>
            </div>
            <div className="modal-body py-4 text-center">
              <div className="ban-icon-wrapper text-danger mx-auto mb-3">
                <i className="fa-solid fa-user-lock fa-3x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">
                {user?.fullName ? `Tài khoản (${user.email}) đã bị khóa!` : 'Tài khoản của bạn đã bị khóa!'}
              </h5>
              <p className="text-muted small px-3 mb-0">
                {message || 'Tài khoản của bạn đã bị Ban Quản Trị khóa do vi phạm quy định của hệ thống. Bạn có thể nhấn nút bên dưới để xem chi tiết lý do và gửi đơn kháng cáo.'}
              </p>
            </div>
            <div className="modal-footer border-top-0 bg-light d-flex justify-content-between p-3">
              <button type="button" className="btn btn-outline-secondary px-3" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket me-1"></i> Đăng xuất
              </button>
              <button type="button" className="btn btn-danger px-4 fw-bold shadow-sm" onClick={handleGoToAppeal}>
                <i className="fa-solid fa-shield-halved me-1"></i> Xem Chi Tiết & Kháng Cáo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BanNotificationModal;
