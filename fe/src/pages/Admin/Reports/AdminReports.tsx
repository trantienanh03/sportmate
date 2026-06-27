import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AdminReport {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId?: number;
  reportedUserName?: string;
  reportedMatchId?: number;
  reportedMatchTitle?: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
}

interface PageData {
  content: AdminReport[];
  totalPages: number;
  number: number;
}

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });
      if (keyword) params.append("keyword", keyword);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`http://localhost:8080/api/admin/reports?${params.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Lỗi tải danh sách báo cáo");
      
      const data: PageData = await response.json();
      setReports(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchReports();
  };

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("DISMISS");
  const [penaltyScore, setPenaltyScore] = useState<number>(10);

  const openActionModal = (report: AdminReport) => {
    setSelectedReportId(report.id);
    setSelectedReport(report);
    setSelectedAction("DISMISS");
    setPenaltyScore(10);
    setActionModalOpen(true);
  };

  const executeAction = async () => {
    if (!selectedReportId) return;

    try {
      let url = `http://localhost:8080/api/admin/reports/${selectedReportId}/action?action=${selectedAction}`;
      if (selectedAction === "PENALTY") {
        url += `&penaltyScore=${penaltyScore}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        credentials: "include"
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Cập nhật thất bại");
      }
      
      const newStatus = selectedAction === "DISMISS" ? "DISMISSED" : "RESOLVED";
      setReports(reports.map(r => r.id === selectedReportId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setActionModalOpen(false);
      setSelectedReportId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="badge bg-warning text-dark">Chờ Xử Lý</span>;
      case 'RESOLVED': return <span className="badge bg-success">Đã Giải Quyết</span>;
      case 'DISMISSED': return <span className="badge bg-secondary">Bỏ Qua</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="admin-reports bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Quản Lý Báo Cáo</h5>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="form-control me-2" 
              placeholder="Tìm theo tên người report/bị report, tiêu đề trận..." 
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
            <option value="PENDING">Chờ xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="DISMISSED">Đã bỏ qua</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Người Báo Cáo</th>
              <th>Đối Tượng Bị Báo Cáo</th>
              <th>Lý Do</th>
              <th>Ngày Tạo</th>
              <th>Trạng Thái</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Đang tải...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Không có báo cáo nào</td>
              </tr>
            ) : (
              reports.map(r => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>
                    <Link to={`/profile/${r.reporterId}`} className="text-decoration-none">
                      {r.reporterName}
                    </Link>
                  </td>
                  <td>
                    {r.reportedUserId ? (
                      <div>
                        User: <Link to={`/profile/${r.reportedUserId}`} className="text-decoration-none text-danger fw-semibold">{r.reportedUserName}</Link>
                      </div>
                    ) : r.reportedMatchId ? (
                      <div>
                        Trận đấu: <Link to={`/matches/${r.reportedMatchId}`} className="text-decoration-none text-danger fw-semibold">{r.reportedMatchTitle}</Link>
                      </div>
                    ) : (
                      <span className="text-muted">Không xác định</span>
                    )}
                  </td>
                  <td>
                    <div className="fw-semibold">{r.reason}</div>
                    <small className="text-muted text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                      {r.details}
                    </small>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td className="text-end">
                    {r.status === 'PENDING' && (
                      <button className="btn btn-sm btn-primary fw-bold" onClick={() => openActionModal(r)}>
                        <i className="fa-solid fa-gavel me-1"></i> Xử lý
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

      {/* Action Modal */}
      {actionModalOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Xử lý Báo cáo #{selectedReportId}</h5>
                  <button type="button" className="btn-close" onClick={() => setActionModalOpen(false)}></button>
                </div>
                <div className="modal-body py-4">
                  {selectedReport && (
                    <div className="alert alert-light border mb-3 py-2">
                      <small className="text-muted">
                        <strong>Đối tượng:</strong>{' '}
                        {selectedReport.reportedUserId ? `Người dùng: ${selectedReport.reportedUserName}` : `Trận đấu: ${selectedReport.reportedMatchTitle}`}
                      </small>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Hành động xử lý:</label>
                    <select 
                      className="form-select" 
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      <option value="DISMISS">Bác bỏ (Tố cáo sai/hiểu lầm)</option>
                      {selectedReport?.reportedUserId && (
                        <>
                          <option value="WARN">Cảnh cáo (Gửi thông báo nhắc nhở)</option>
                          <option value="PENALTY">Trừ điểm uy tín</option>
                          <option value="BAN">Khóa tài khoản vĩnh viễn (Vi phạm nghiêm trọng)</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  {selectedAction === "PENALTY" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Số điểm uy tín bị trừ:</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={penaltyScore}
                        onChange={(e) => setPenaltyScore(Number(e.target.value))}
                        min="1"
                        max="100"
                      />
                      <small className="text-muted">Người bị tố cáo sẽ bị trừ số điểm này khỏi hệ thống.</small>
                    </div>
                  )}

                  {selectedAction === "BAN" && (
                    <div className="alert alert-danger mt-3 mb-0" role="alert">
                      <i className="fa-solid fa-triangle-exclamation me-2"></i>
                      <strong>Cảnh báo:</strong> Hành động này sẽ lập tức khóa tài khoản của người dùng. Họ sẽ không thể đăng nhập hoặc sử dụng hệ thống.
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setActionModalOpen(false)}>Hủy</button>
                  <button type="button" className="btn btn-primary px-4 fw-bold" onClick={executeAction}>Xác nhận xử lý</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
