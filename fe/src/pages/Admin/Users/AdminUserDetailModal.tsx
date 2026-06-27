import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AdminUserDetailModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [repScore, setRepScore] = useState(100);

  useEffect(() => {
    if (isOpen && userId) {
      fetchDetails();
    }
  }, [isOpen, userId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/details`, { credentials: 'include' });
      const result = await res.json();
      setData(result);
      setRepScore(result.stats?.reputationScore || 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [confirmRole, setConfirmRole] = useState<string | null>(null);

  const handleUpdateRoleClick = (newRole: string) => {
    setConfirmRole(newRole);
  };

  const executeUpdateRole = async () => {
    if (!confirmRole) return;
    try {
      await fetch(`http://localhost:8080/api/admin/users/${userId}/role?role=${confirmRole}`, { method: 'PUT', credentials: 'include' });
      fetchDetails();
    } catch (err) {
      alert("Lỗi cấp quyền");
    } finally {
      setConfirmRole(null);
    }
  };

  const handleUpdateReputation = async () => {
    try {
      await fetch(`http://localhost:8080/api/admin/users/${userId}/reputation?score=${repScore}`, { method: 'PUT', credentials: 'include' });
      alert("Đã cập nhật uy tín");
      fetchDetails();
    } catch (err) {
      alert("Lỗi cập nhật uy tín");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold">Hồ sơ chi tiết User #{userId}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body pt-2">
              {loading || !data ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
              ) : (
                <>
                  <ul className="nav nav-tabs mb-4 border-bottom-0">
                    <li className="nav-item">
                      <button className={`nav-link border-0 fw-semibold ${activeTab === 'profile' ? 'active text-primary bg-primary-subtle rounded' : 'text-muted'}`} onClick={() => setActiveTab('profile')}>Thông tin</button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link border-0 fw-semibold ${activeTab === 'stats' ? 'active text-primary bg-primary-subtle rounded' : 'text-muted'}`} onClick={() => setActiveTab('stats')}>Uy tín</button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link border-0 fw-semibold ${activeTab === 'matches' ? 'active text-primary bg-primary-subtle rounded' : 'text-muted'}`} onClick={() => setActiveTab('matches')}>Hoạt động</button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link border-0 fw-semibold ${activeTab === 'friends' ? 'active text-primary bg-primary-subtle rounded' : 'text-muted'}`} onClick={() => setActiveTab('friends')}>Bạn bè</button>
                    </li>
                  </ul>

                  {activeTab === 'profile' && (
                    <div className="row g-4">
                      <div className="col-md-4 text-center">
                        <img src={data.profile.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="rounded-circle mb-3 object-fit-cover" width="120" height="120" />
                        <h5 className="fw-bold mb-1">{data.profile.fullName}</h5>
                        <p className="text-muted small">{data.profile.email}</p>
                        <span className={`badge ${data.profile.role === 'admin' ? 'bg-danger' : 'bg-secondary'} mb-3`}>{data.profile.role.toUpperCase()}</span>
                      </div>
                      <div className="col-md-8">
                        <div className="card border-0 shadow-sm">
                          <div className="card-body">
                            <p><strong>SĐT:</strong> {data.profile.phone || 'Chưa cập nhật'}</p>
                            <p><strong>Trạng thái:</strong> {data.profile.isBanned ? <span className="text-danger fw-bold">Đang bị khóa (tới {data.profile.bannedUntil ? format(new Date(data.profile.bannedUntil), 'dd/MM/yyyy') : 'vĩnh viễn'})</span> : <span className="text-success fw-bold">Hoạt động</span>}</p>
                            <p><strong>Ngày tham gia:</strong> {format(new Date(data.profile.createdAt), 'dd MMMM yyyy', { locale: vi })}</p>
                            
                            <hr />
                            <h6 className="fw-bold mb-3">Phân quyền</h6>
                            {data.profile.role === 'admin' ? (
                              <button className="btn btn-outline-secondary" onClick={() => handleUpdateRoleClick('user')}>Hạ cấp thành User</button>
                            ) : (
                              <button className="btn btn-outline-danger" onClick={() => handleUpdateRoleClick('admin')}>Nâng cấp thành Admin</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'stats' && (
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 bg-light">
                          <div className="card-body text-center py-4">
                            <h2 className="display-4 fw-bold text-primary mb-0">{data.stats.completedMatches}</h2>
                            <p className="text-muted mb-0">Trận đã hoàn thành</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 bg-light">
                          <div className="card-body text-center py-4">
                            <h2 className="display-4 fw-bold text-danger mb-0">{data.stats.noShows || 0}</h2>
                            <p className="text-muted mb-0">Trận bùng kèo</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 mt-4">
                        <div className="card border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="fw-bold mb-3">Điều chỉnh Điểm Uy Tín</h6>
                            <div className="d-flex align-items-center">
                              <input type="number" className="form-control w-25 me-3" value={repScore} onChange={e => setRepScore(Number(e.target.value))} />
                              <button className="btn btn-primary" onClick={handleUpdateReputation}>Lưu cập nhật</button>
                            </div>
                            <small className="text-muted mt-2 d-block">Điểm uy tín mặc định là 100. Có thể trừ điểm nếu người dùng vi phạm.</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'matches' && (
                    <div className="list-group list-group-flush">
                      {data.recentMatches.length === 0 ? <p className="text-muted">Chưa có trận đấu nào</p> : 
                        data.recentMatches.map((m: any) => (
                          <div key={m.id} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 mb-2 rounded bg-light px-3">
                            <div>
                              <h6 className="mb-1 fw-bold">{m.title}</h6>
                              <small className="text-muted">{format(new Date(m.startTime), 'HH:mm dd/MM/yyyy')} • {m.sport}</small>
                            </div>
                            <span className="badge bg-primary-subtle text-primary">{m.status}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}

                  {activeTab === 'friends' && (
                    <div className="row g-3">
                      {data.friends.length === 0 ? <p className="text-muted">Chưa có bạn bè</p> : 
                        data.friends.map((f: any) => (
                          <div key={f.userId} className="col-md-6">
                            <div className="d-flex align-items-center p-2 border rounded">
                              <img src={f.avatarUrl || 'https://via.placeholder.com/40'} alt="" className="rounded-circle me-3 object-fit-cover" width="40" height="40" />
                              <h6 className="mb-0 fw-semibold">{f.fullName}</h6>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmRole && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h6 className="modal-title fw-bold">Xác nhận cấp quyền</h6>
                  <button type="button" className="btn-close" onClick={() => setConfirmRole(null)}></button>
                </div>
                <div className="modal-body py-4 text-center">
                  <p className="mb-0">Bạn có chắc muốn cấp quyền <strong>{confirmRole.toUpperCase()}</strong> cho user này?</p>
                </div>
                <div className="modal-footer border-top-0 d-flex justify-content-center pt-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setConfirmRole(null)}>Hủy</button>
                  <button type="button" className="btn btn-primary px-4" onClick={executeUpdateRole}>Đồng ý</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdminUserDetailModal;
