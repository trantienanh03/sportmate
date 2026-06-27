import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AdminMatch {
  id: number;
  title: string;
  sport: string;
  hostName: string;
  hostId: number;
  startTime: string;
  endTime: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  createdAt: string;
}

interface PageData {
  content: AdminMatch[];
  totalPages: number;
  number: number;
}

const AdminMatches: React.FC = () => {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });
      if (keyword) params.append("keyword", keyword);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`http://localhost:8080/api/admin/matches?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Lỗi tải danh sách trận đấu");
      
      const data: PageData = await response.json();
      setMatches(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [page, statusFilter]);

  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchMatches();
  };

  const executeCancelMatch = async () => {
    if (!confirmCancelId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/matches/${confirmCancelId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Hủy trận thất bại");
      }
      
      setMatches(matches.map(m => m.id === confirmCancelId ? { ...m, status: "cancelled" } : m));
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setConfirmCancelId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="badge bg-primary">Mở</span>;
      case 'full': return <span className="badge bg-warning text-dark">Đầy</span>;
      case 'completed': return <span className="badge bg-success">Hoàn thành</span>;
      case 'cancelled': return <span className="badge bg-danger">Đã Hủy</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="admin-matches bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Quản Lý Trận Đấu</h5>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="form-control me-2" 
              placeholder="Tìm theo tiêu đề trận đấu..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Tìm kiếm</button>
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
            <option value="open">Mở đăng ký</option>
            <option value="full">Đã đầy</option>
            <option value="completed">Đã kết thúc</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Tiêu Đề</th>
              <th>Môn Thể Thao</th>
              <th>Host (Chủ sân)</th>
              <th>Thời Gian</th>
              <th>Thành Viên</th>
              <th>Trạng Thái</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">Đang tải...</td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">Không tìm thấy trận đấu nào</td>
              </tr>
            ) : (
              matches.map(m => (
                <tr key={m.id}>
                  <td>#{m.id}</td>
                  <td>
                    <Link to={`/matches/${m.id}`} className="text-decoration-none fw-semibold text-dark">
                      {m.title}
                    </Link>
                  </td>
                  <td><span className="badge bg-info text-dark">{m.sport}</span></td>
                  <td>
                    <Link to={`/profile/${m.hostId}`} className="text-decoration-none">
                      {m.hostName}
                    </Link>
                  </td>
                  <td>
                    <div>{new Date(m.startTime).toLocaleDateString('vi-VN')}</div>
                    <small className="text-muted">
                      {new Date(m.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      {m.endTime ? ` - ${new Date(m.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}` : ''}
                    </small>
                  </td>
                  <td>{m.currentParticipants} / {m.maxParticipants}</td>
                  <td>{getStatusBadge(m.status)}</td>
                  <td className="text-end">
                    <Link to={`/matches/${m.id}`} className="btn btn-sm btn-outline-primary me-2" title="Xem chi tiết">
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                    {(m.status === 'open' || m.status === 'full') && (
                      <button 
                        className="btn btn-sm btn-danger"
                        title="Hủy trận đấu"
                        onClick={() => setConfirmCancelId(m.id)}
                      >
                        <i className="fa-solid fa-ban"></i>
                      </button>
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

      {/* Confirm Modal */}
      {confirmCancelId && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h6 className="modal-title fw-bold text-danger">Xác nhận hủy trận</h6>
                  <button type="button" className="btn-close" onClick={() => setConfirmCancelId(null)}></button>
                </div>
                <div className="modal-body py-4 text-center">
                  <p className="mb-0">Bạn có chắc muốn hủy trận đấu <strong>#{confirmCancelId}</strong>?</p>
                  <small className="text-muted d-block mt-2">Hành động này không thể hoàn tác.</small>
                </div>
                <div className="modal-footer border-top-0 d-flex justify-content-center pt-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setConfirmCancelId(null)}>Đóng</button>
                  <button type="button" className="btn btn-danger px-4" onClick={executeCancelMatch}>Đồng ý hủy</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMatches;
