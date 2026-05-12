import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoggedInNavbar.css';

const LoggedInNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg logged-in-nav sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold me-4" to="/home">
          <span className="brand-sport">Sport</span>
          <span className="brand-matcher">Mate</span>
        </Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#loggedInNav"
          aria-controls="loggedInNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="loggedInNav">
          <form className="d-flex search-form me-auto">
            <div className="input-group search-group">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search events..."
                aria-label="Search events"
              />
              <span className="input-group-text search-location">
                Ho Chi Minh City, VN
              </span>
              <button className="btn search-btn" type="button">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </form>

          <ul className="navbar-nav ms-auto align-items-center flex-row gap-3 gap-lg-0 mt-3 mt-lg-0">
            <li className="nav-item d-none d-lg-block">
              <a className="nav-link nav-action-link fw-bold" href="#">Start a new group</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-bell"></i>
                <span className="notification-dot"></span>
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-message"></i>
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-circle-question"></i>
              </a>
            </li>
            <li className="nav-item ms-2">
              <div className="dropdown">
                <a
                  className="nav-link dropdown-toggle user-avatar-link"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="user-avatar">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                  <li className="px-3 py-2 border-bottom">
                    <span className="fw-bold d-block text-truncate" style={{ maxWidth: '150px' }}>{user?.fullName}</span>
                    <small className="text-muted d-block text-truncate" style={{ maxWidth: '150px' }}>{user?.email}</small>
                  </li>
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}>Log out</a></li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default LoggedInNavbar;
