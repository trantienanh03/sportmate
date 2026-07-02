import React, { useEffect, useState } from "react";
import AdminUserDetailModal from "./AdminUserDetailModal";
import { adminUserService } from "../../../services/adminService";

interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string;
  isActive: boolean;
  isBanned: boolean;
  bannedUntil: string;
  createdAt: string;
}

interface PageData {
  content: AdminUser[];
  totalPages: number;
  number: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("user"); // Mặc định hiển thị tab User
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), size: "10" });
      if (keyword) params.append("keyword", keyword);
      if (statusFilter) params.append("status", statusFilter);
      if (roleFilter) params.append("role", roleFilter);

      const data: PageData = await adminUserService.getList(params);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, id: number, action: string, message: string } | null>(null);

  const handleToggleBanClick = (id: number, action: string) => {
    let confirmMsg = action === 'UNBAN' ? 'mở khóa' : 'khóa';
    setConfirmConfig({
      isOpen: true,
      id,
      action,
      message: `Bạn có chắc chắn muốn ${confirmMsg} tài khoản này không?`
    });
  };

  const executeToggleBan = async () => {
    if (!confirmConfig) return;
    const { id, action } = confirmConfig;
    try {
      await adminUserService.updateStatus(id, action);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setConfirmConfig(null);
    }
  };

  return (
    <div className="admin-users bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Quản Lý Người Dùng & Quản Trị Viên</h5>
      </div>

      {/* Nav Tabs chia theo Role */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${roleFilter === 'user' ? 'active text-primary border-bottom border-primary border-2' : 'text-muted'}`}
            onClick={() => {
              setRoleFilter('user');
              setPage(0);
            }}
          >
            <i className="fa-solid fa-users me-2"></i>
            Người Dùng (Users)
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${roleFilter === 'admin' ? 'active text-primary border-bottom border-primary border-2' : 'text-muted'}`}
            onClick={() => {
              setRoleFilter('admin');
              setPage(0);
            }}
          >
            <i className="fa-solid fa-user-shield me-2"></i>
            Quản Trị Viên (Admins)
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link fw-semibold px-4 ${roleFilter === '' ? 'active text-primary border-bottom border-primary border-2' : 'text-muted'}`}
            onClick={() => {
              setRoleFilter('');
              setPage(0);
            }}
          >
            <i className="fa-solid fa-list me-2"></i>
            Tất Cả
          </button>
        </li>
      </ul>

      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
          <i className="fa-solid fa-circle-exclamation me-2"></i>
          {error}
        </div>
      )}

      <div className="row mb-3 g-2">
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="form-control me-2" 
              placeholder="Tìm theo tên, email, SĐT..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-primary px-3" type="submit">
              <i className="fa-solid fa-magnifying-glass me-1"></i> Tìm
            </button>
          </form>
        </div>
        <div className="col-md-4 ms-auto">
          <select 
            className="form-select" 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="BANNED">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Container đảm bảo Dropdown menu không bị cắt bởi scroll */}
      <div className="table-responsive" style={{ minHeight: '340px', paddingBottom: '90px' }}>
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Người Dùng</th>
              <th>Liên Hệ</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Ngày Tham Gia</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Đang tải...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">Không tìm thấy tài khoản nào</td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="rounded-circle me-2" width="32" height="32" style={{objectFit: 'cover'}}/>
                      ) : (
                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{width: 32, height: 32}}>
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                      <span className="fw-semibold">{u.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-truncate" style={{maxWidth: '180px'}} title={u.email}>{u.email}</div>
                    {u.phone && <div className="small text-muted"><i className="fa-solid fa-phone me-1"></i>{u.phone}</div>}
                  </td>
                  <td>
                    {u.role === 'admin' ? (
                      <span className="badge bg-danger">ADMIN</span>
                    ) : (
                      <span className="badge bg-secondary">USER</span>
                    )}
                  </td>
                  <td>
                    {u.isBanned ? (
                      <span className="badge bg-danger">Bị Khóa</span>
                    ) : (
                      <span className="badge bg-success">Hoạt Động</span>
                    )}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" title="Xem chi tiết" onClick={() => setSelectedUserId(u.id)}>
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    {u.role !== 'admin' && (
                      <div className="btn-group dropdown">
                        <button type="button" className={`btn btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'} dropdown-toggle`} data-bs-toggle="dropdown" aria-expanded="false" title={u.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}>
                          <i className={`fa-solid ${u.isBanned ? 'fa-unlock me-1' : 'fa-lock me-1'}`}></i>
                          {u.isBanned ? 'Mở khóa' : 'Khóa'}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" style={{ zIndex: 1060 }}>
                          {u.isBanned ? (
                            <li><button className="dropdown-item text-success fw-bold py-2" onClick={() => handleToggleBanClick(u.id, 'UNBAN')}><i className="fa-solid fa-unlock me-2"></i>Mở khóa ngay</button></li>
                          ) : (
                            <>
                              <li><button className="dropdown-item py-2" onClick={() => handleToggleBanClick(u.id, 'BAN_7_DAYS')}><i className="fa-solid fa-calendar-week me-2"></i>Khóa 7 ngày</button></li>
                              <li><button className="dropdown-item py-2" onClick={() => handleToggleBanClick(u.id, 'BAN_30_DAYS')}><i className="fa-solid fa-calendar-days me-2"></i>Khóa 30 ngày</button></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><button className="dropdown-item text-danger fw-bold py-2" onClick={() => handleToggleBanClick(u.id, 'BAN_PERMANENT')}><i className="fa-solid fa-ban me-2"></i>Khóa vĩnh viễn</button></li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>Sau</button>
            </li>
          </ul>
        </div>
      )}

      {selectedUserId && (
        <AdminUserDetailModal 
          userId={selectedUserId} 
          isOpen={!!selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}

      {/* Confirm Modal */}
      {confirmConfig && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h6 className="modal-title fw-bold">Xác nhận thao tác</h6>
                  <button type="button" className="btn-close" onClick={() => setConfirmConfig(null)}></button>
                </div>
                <div className="modal-body py-4 text-center">
                  <p className="mb-0">{confirmConfig.message}</p>
                </div>
                <div className="modal-footer border-top-0 d-flex justify-content-center pt-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setConfirmConfig(null)}>Hủy</button>
                  <button type="button" className="btn btn-primary px-4" onClick={executeToggleBan}>Đồng ý</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
