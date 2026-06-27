import React, { useEffect, useRef, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./AdminLayout.css";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  const [adminToasts, setAdminToasts] = useState<any[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: {},
      debug: () => {},
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/admin/reports`, (message) => {
        if (message.body) {
          const reportDto = JSON.parse(message.body);
          const newToast = {
            id: Math.random().toString(),
            title: "Báo cáo vi phạm mới",
            content: `Người dùng ${reportDto.reporterName} vừa gửi một báo cáo mới.`,
            time: new Date().toLocaleTimeString(),
          };
          setAdminToasts((prev) => [...prev, newToast]);
          setTimeout(() => {
            setAdminToasts((prev) => prev.filter((t) => t.id !== newToast.id));
          }, 6000);
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [user]);

  const menuItems = [
    { path: "/admin/dashboard", label: "Tổng Quan", icon: "fa-solid fa-chart-pie" },
    { path: "/admin/users", label: "Người Dùng", icon: "fa-solid fa-users" },
    { path: "/admin/matches", label: "Trận Đấu", icon: "fa-solid fa-futbol" },
    { path: "/admin/reports", label: "Báo Cáo", icon: "fa-solid fa-flag" },
    { path: "/admin/categories", label: "Danh Mục Sân & Môn", icon: "fa-solid fa-layer-group" },
    { path: "/admin/bills", label: "Chia Tiền Sân", icon: "fa-solid fa-file-invoice-dollar" },
  ];

  return (
    <div className="admin-layout d-flex">
      {/* Sidebar */}
      <aside className="admin-sidebar shadow-sm">
        <div className="sidebar-header">
          <Link className="navbar-brand fw-bold" to="/home">
            <span className="brand-sport">Sport</span>
            <span className="brand-matcher">Mate</span>
            <span className="ms-2 badge bg-danger">ADMIN</span>
          </Link>
        </div>
        <div className="sidebar-menu mt-4">
          <ul className="list-unstyled">
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`menu-link ${location.pathname.startsWith(item.path) ? "active" : ""}`}
                >
                  <i className={`${item.icon} menu-icon`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="sidebar-footer">
          <a href="#" className="menu-link text-danger" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket menu-icon"></i>
            Đăng xuất
          </a>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="admin-main flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="admin-header shadow-sm d-flex justify-content-between align-items-center px-4 py-3">
          <div className="header-title">
            <h5 className="mb-0 fw-bold">Admin Dashboard</h5>
          </div>
          <div className="header-actions d-flex align-items-center gap-3">
            <button className="btn btn-light rounded-circle shadow-sm">
              <i className="fa-regular fa-bell"></i>
            </button>
            <div className="dropdown">
              <a
                className="d-flex align-items-center text-decoration-none dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="user-avatar-sm me-2">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="admin avatar" />
                  ) : (
                    <div className="avatar-placeholder">{user?.fullName?.charAt(0) || "A"}</div>
                  )}
                </div>
                <span className="fw-semibold text-dark">{user?.fullName}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li><Link className="dropdown-item" to="/profile">Hồ sơ cá nhân</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}>Đăng xuất</a></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content flex-grow-1 p-4 bg-light overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Admin Toasts */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        {adminToasts.map((toast) => (
          <div key={toast.id} className="toast show align-items-center text-bg-warning border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">
                <strong><i className="fa-solid fa-bell me-2"></i>{toast.title}</strong>
                <p className="mb-0 mt-1">{toast.content}</p>
                <small className="text-muted d-block mt-1">{toast.time}</small>
              </div>
              <button type="button" className="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onClick={() => setAdminToasts(prev => prev.filter(t => t.id !== toast.id))}></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;
