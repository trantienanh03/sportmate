import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminBillService } from "../../../services/adminService";

interface PaymentDetail {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  status: string;
  scannedAt?: string;
  paidAt?: string;
}

interface AdminBill {
  id: number;
  roomId: number;
  matchId?: number;
  creatorId: number;
  creatorName: string;
  title: string;
  totalAmount: number;
  perPerson: number;
  participantCount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: string;
  createdAt: string;
  closedAt?: string;
}

interface PageData {
  content: AdminBill[];
  totalPages: number;
  number: number;
}

const AdminBills: React.FC = () => {
  const [bills, setBills] = useState<AdminBill[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detailBill, setDetailBill] = useState<AdminBill | null>(null);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), size: "10" });
      if (statusFilter) params.append("status", statusFilter);
      const data: PageData = await adminBillService.getList(params);
      setBills(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [page, statusFilter]);

  const openDetailModal = async (bill: AdminBill) => {
    setDetailBill(bill);
    setPayments([]);
    setPaymentsLoading(true);
    try {
      const data = await adminBillService.getPayments(bill.id);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="badge bg-primary">Đang hoạt động</span>;
      case 'COMPLETED': return <span className="badge bg-success">Đã hoàn thành</span>;
      case 'CLOSED': return <span className="badge bg-secondary">Đã đóng</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="badge bg-warning text-dark">Chưa thanh toán</span>;
      case 'SCANNED': return <span className="badge bg-info text-dark">Đã quét QR</span>;
      case 'PAID': return <span className="badge bg-success">Đã xác nhận</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const scannedCount = payments.filter(p => p.status === 'SCANNED').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <div className="admin-bills bg-white p-4 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Tra Soát Chia Tiền Sân</h5>
        <select
          className="form-select form-select-sm w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="COMPLETED">Đã hoàn thành</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Host (Người tạo)</th>
              <th>Trận đấu</th>
              <th>Tổng Tiền</th>
              <th>Mỗi người</th>
              <th>Số người</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-4">Đang tải...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-4 text-muted">Không có hóa đơn nào</td></tr>
            ) : (
              bills.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td className="fw-semibold">{b.title}</td>
                  <td>
                    <Link to={`/profile/${b.creatorId}`} className="text-decoration-none">
                      {b.creatorName}
                    </Link>
                  </td>
                  <td>
                    {b.matchId ? (
                      <Link to={`/matches/${b.matchId}`} className="text-decoration-none small">
                        <i className="fa-solid fa-futbol me-1"></i>#{b.matchId}
                      </Link>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="fw-bold text-danger">{b.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td>{b.perPerson.toLocaleString('vi-VN')} đ</td>
                  <td className="text-center">{b.participantCount}</td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td><small>{new Date(b.createdAt).toLocaleDateString('vi-VN')}</small></td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      title="Xem chi tiết thanh toán"
                      onClick={() => openDetailModal(b)}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
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

      {/* Detail Modal */}
      {detailBill && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1070 }}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1075 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0">
                  <div>
                    <h5 className="modal-title fw-bold">Chi tiết Bill #{detailBill.id}</h5>
                    <small className="text-muted">{detailBill.title}</small>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setDetailBill(null)}></button>
                </div>
                <div className="modal-body pt-2">
                  {/* Summary cards */}
                  <div className="row g-2 mb-4">
                    <div className="col-4">
                      <div className="bg-light rounded p-3 text-center">
                        <div className="fw-bold fs-5 text-danger">{detailBill.totalAmount.toLocaleString('vi-VN')} đ</div>
                        <small className="text-muted">Tổng tiền</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-light rounded p-3 text-center">
                        <div className="fw-bold fs-5">{detailBill.perPerson.toLocaleString('vi-VN')} đ</div>
                        <small className="text-muted">Mỗi người</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="bg-light rounded p-3 text-center">
                        <div className="fw-bold fs-5">{detailBill.participantCount}</div>
                        <small className="text-muted">Số người</small>
                      </div>
                    </div>
                  </div>

                  {/* Bank info */}
                  <div className="alert alert-light border mb-3 py-2">
                    <div className="d-flex gap-4 flex-wrap">
                      <div><small className="text-muted d-block">Ngân hàng</small><strong>{detailBill.bankCode}</strong></div>
                      <div><small className="text-muted d-block">Số tài khoản</small><strong>{detailBill.accountNumber}</strong></div>
                      <div><small className="text-muted d-block">Chủ tài khoản</small><strong>{detailBill.accountName}</strong></div>
                    </div>
                  </div>

                  {/* Payment status summary */}
                  {!paymentsLoading && payments.length > 0 && (
                    <div className="d-flex gap-3 mb-3">
                      <span className="badge bg-success fs-6 px-3">{paidCount} Đã xác nhận</span>
                      <span className="badge bg-info text-dark fs-6 px-3">{scannedCount} Đã quét QR</span>
                      <span className="badge bg-warning text-dark fs-6 px-3">{pendingCount} Chưa thanh toán</span>
                    </div>
                  )}

                  {/* Payments table */}
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Thành viên</th>
                          <th>Số tiền</th>
                          <th>Trạng thái</th>
                          <th>Quét lúc</th>
                          <th>Xác nhận lúc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentsLoading ? (
                          <tr><td colSpan={5} className="text-center py-3">Đang tải...</td></tr>
                        ) : payments.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-3 text-muted">Chưa có dữ liệu thanh toán</td></tr>
                        ) : payments.map(p => (
                          <tr key={p.id}>
                            <td>
                              <Link to={`/profile/${p.userId}`} className="text-decoration-none fw-semibold">
                                {p.userName}
                              </Link>
                            </td>
                            <td className="fw-bold">{p.amount.toLocaleString('vi-VN')} đ</td>
                            <td>{getPaymentStatusBadge(p.status)}</td>
                            <td><small>{p.scannedAt ? new Date(p.scannedAt).toLocaleString('vi-VN') : '—'}</small></td>
                            <td><small>{p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '—'}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  {detailBill.matchId && (
                    <Link to={`/matches/${detailBill.matchId}`} className="btn btn-outline-primary btn-sm" target="_blank">
                      <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Xem trận đấu
                    </Link>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => setDetailBill(null)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBills;
